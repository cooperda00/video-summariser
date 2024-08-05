import type { NextApiRequest, NextApiResponse } from "next";
import { getSubtitles } from "youtube-captions-scraper";
import { extractYoutubeVideoId } from "@/lib";
import { getAuth } from "@clerk/nextjs/server";
import { z } from "zod";
import { createClient } from "redis";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

export const config = {
  maxDuration: 60, // Allow max (free) duration on vercel
};

const { OPENAI_API_KEY } = process.env;

const openAI = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const systemPrompt: ChatCompletionMessageParam = {
  role: "system",
  content: `
  You are a helpful assistant. 
  A user will provide you with a transcript, your job is to read it and generate a summary. 
  This summary should be a bullet pointed list with the main ideas. Ensure that there is no repetion. 
  For each main idea provide the specific details as sub-bullet points. 
  If there are any facts or statistics, include those in the sub bullet points.`,
};

const { REDIS_PASSWORD, REDIS_HOST, REDIS_PORT } = process.env;

const redis = createClient({
  password: REDIS_PASSWORD,
  socket: {
    host: REDIS_HOST,
    port: Number(REDIS_PORT),
  },
});

const TTL = 86400 * 5; // 5 days

const getRedisKey = (
  userId: string,
  type: "summary" | "transcripts",
  videoId: string
): string => {
  return `user:${userId}:${type}:${videoId}`;
};

const BodySchema = z.object({
  url: z.string().url(),
});

type Response =
  | {
      transcript: string[];
      summary: string;
    }
  | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: "You are not authenticated" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Wrong method" });
  }

  const { data, error } = BodySchema.safeParse(req.body);

  if (!data && error) {
    return res.status(400).json({ error: error.message });
  }

  const videoID = extractYoutubeVideoId(data.url);

  if (!videoID) {
    return res.status(422).json({ error: "Cannot find video id" });
  }

  const transcriptKey = getRedisKey(userId, "transcripts", videoID);
  const summaryKey = getRedisKey(userId, "summary", videoID);

  try {
    if (!redis.isOpen) {
      await redis.connect();
    }

    const cachedTranscript = await redis.lRange(transcriptKey, 0, -1);
    const cachedSummary = await redis.get(summaryKey);

    if (cachedSummary && cachedTranscript.length) {
      return res
        .status(200)
        .json({ summary: cachedSummary, transcript: cachedTranscript });
    }

    const captions = await getSubtitles({
      videoID,
    });

    const transcript = captions.map((caption) => caption.text);

    const chatRes = await openAI.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        systemPrompt,
        { role: "user", content: transcript.join("\n") },
      ],
    });

    const summary = chatRes.choices[0].message.content;

    if (!chatRes.choices.length || !summary) {
      return res.status(500).json({ error: "Failed to create summary" });
    }

    await redis
      .multi()
      .del(transcriptKey)
      .rPush(transcriptKey, transcript)
      .expire(transcriptKey, TTL)
      .set(summaryKey, summary)
      .expire(summaryKey, TTL)
      .exec();

    return res.status(200).json({ transcript, summary });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: (error as Error).message });
  }
}
