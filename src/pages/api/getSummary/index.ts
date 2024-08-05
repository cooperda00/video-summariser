import type { NextApiRequest, NextApiResponse } from "next";
import { getSubtitles } from "youtube-captions-scraper";
import {
  extractYoutubeVideoId,
  getRedisKey,
  redis,
  TTL,
  openAI,
  systemPrompt,
} from "@/lib";
import { getAuth } from "@clerk/nextjs/server";
import { z } from "zod";

export const BodySchema = z.object({
  url: z.string().url(),
});

export type Response =
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
