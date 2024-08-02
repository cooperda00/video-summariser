import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { Converter } from "showdown";
import htmlToPdf from "html-pdf-node";

const markdownToHTMLConverter = new Converter();

type Response = Buffer | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  const { userId, sessionClaims } = getAuth(req);

  if (!userId || !sessionClaims.email) {
    return res.status(401).json({ error: "You are not authenticated" });
  }

  // TODO : Validate with Zod
  if (!req.body.summary) {
    return res.status(400).json({ error: "No summary provided" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Wrong method" });
  }

  const html = markdownToHTMLConverter.makeHtml(req.body.summary);

  // TODO : styling etc
  htmlToPdf.generatePdf(
    { content: html },
    { format: "A4" },
    (error, pdfBuffer) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
      } else {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=summary.pdf"
        );
        res.status(200).send(Buffer.from(pdfBuffer));
      }
    }
  );
}
