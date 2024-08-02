import type { NextApiRequest, NextApiResponse } from "next";
import { getSubtitles } from "youtube-captions-scraper";
import OpenAI from "openai";
import { extractYoutubeVideoId } from "@/lib";

const openAPI = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
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
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Wrong Method" });
  }

  // TODO : Parse with Zod
  if (!req.body.url) {
    return res.status(400).json({ error: "No url provided" });
  }

  const videoID = extractYoutubeVideoId(req.body.url);

  if (!videoID) {
    return res.status(422).json({ error: "Cannot find video id" });
  }

  try {
    const captions = await getSubtitles({
      videoID,
    });

    const transcript = captions.map((caption) => caption.text);

    const chatRes = await openAPI.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant. A user will provide you with a transcript, your job is to read it and generate a succinct summary. This summary should be a bullet pointed list with the main ideas. Ensure that there is no repetion. For each main idea, if it is relevant to do so provide the specifics as sub-bullet points. If there are any facts or statistics, include those.",
        },
        { role: "user", content: transcript.join("\n") },
      ],
    });

    if (!chatRes.choices.length || !chatRes.choices[0].message.content) {
      return res.status(500).json({ error: "Could not create summary" });
    }

    return res
      .status(200)
      .json({ transcript, summary: chatRes.choices[0].message.content });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: (error as Error).message });
  }
}
