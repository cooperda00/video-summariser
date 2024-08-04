import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

const { OPENAI_API_KEY } = process.env;

export const openAI = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export const systemPrompt: ChatCompletionMessageParam = {
  role: "system",
  content: `
  You are a helpful assistant. 
  A user will provide you with a transcript, your job is to read it and generate a summary. 
  This summary should be a bullet pointed list with the main ideas. Ensure that there is no repetion. 
  For each main idea provide the specific details as sub-bullet points. 
  If there are any facts or statistics, include those in the sub bullet points.`,
};
