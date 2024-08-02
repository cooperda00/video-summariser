import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { ServerClient } from "postmark";
import { Converter } from "showdown";

const markdownToHTMLConverter = new Converter();

const emailClient = new ServerClient(process.env.POSTMARK_API_KEY ?? "");

type Response = "success" | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  const { userId, sessionClaims } = getAuth(req);

  if (!userId || !sessionClaims.email) {
    return res.status(401).json({ error: "You are not authenticated" });
  }

  // Validate with Zod
  if (!req.body.summary) {
    return res.status(400).json({ error: "No summary provided" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Wrong method" });
  }

  try {
    await emailClient.sendEmail({
      From: "info@danielcooper.io",
      To: "info@danielcooper.io",
      Subject: "Your video summary",
      HtmlBody: markdownToHTMLConverter.makeHtml(req.body.summary), // Convert markdown string to markup {showdown?}
    });

    return res.status(200).send("success");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: (error as Error).message });
  }
}
