import { ServerClient } from "postmark";

export const emailClient = new ServerClient(process.env.POSTMARK_API_KEY ?? "");
