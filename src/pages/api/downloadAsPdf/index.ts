import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { Converter } from "showdown";
import htmlToPdf from "html-pdf-node";
import { z } from "zod";

const BodySchema = z.object({
  summary: z.string(),
});

type Response = Buffer | { error: string };

const markdownToHTMLConverter = new Converter();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  const { userId, sessionClaims } = getAuth(req);

  if (!userId || !sessionClaims.email) {
    return res.status(401).json({ error: "You are not authenticated" });
  }

  if (req.method !== "POST") {
    console.log(req.method);
    return res.status(405).json({ error: "Wrong method" });
  }

  const { data, error } = BodySchema.safeParse(req.body);

  if (!data && error) {
    return res.status(400).json({ error: error.message });
  }

  const html = markdownToHTMLConverter.makeHtml(data.summary);

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
