import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { Converter } from "showdown";
import { z } from "zod";
import axios, { AxiosError } from "axios";

const BodySchema = z.object({
  summary: z.string(),
});

type Response = { url: string } | { error: string };

const markdownToHTMLConverter = new Converter({});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  const { userId, sessionClaims } = getAuth(req);

  if (!userId || !sessionClaims.email) {
    return res.status(401).json({ error: "You are not authenticated" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Wrong method" });
  }

  const { data, error } = BodySchema.safeParse(req.body);

  if (!data && error) {
    return res.status(400).json({ error: error.message });
  }

  const html = markdownToHTMLConverter.makeHtml(data.summary);

  const source = `
  <html>
  ${html}
  </html>
  `
    .split("\n")
    .map((line) => line.trim())
    .join("");

  try {
    const pdfRes = await axios.post(
      "https://pdfswitch.io/api/convert/",
      { source, filename: "summary.pdf" },
      { headers: { Authorization: `Bearer ${process.env.PDF_SWITCH_API_KEY}` } }
    );

    res.status(200).send({ url: pdfRes.data.url });
  } catch (error) {
    if (error instanceof AxiosError) {
      res.status(error.status ?? 500).send({ error: error.message });
    }
  }
}
