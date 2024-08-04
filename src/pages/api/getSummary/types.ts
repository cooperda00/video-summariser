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
