import { z } from "zod";

export const BodySchema = z.object({
  summary: z.string(),
});

export type Response = Buffer | { error: string };
