import { createClient } from "redis";

const { REDIS_PASSWORD, REDIS_HOST, REDIS_PORT } = process.env;

export const redis = createClient({
  password: REDIS_PASSWORD,
  socket: {
    host: REDIS_HOST,
    port: Number(REDIS_PORT),
  },
});

export const TTL = 86400 * 5; // 5 days

export const getRedisKey = (
  userId: string,
  type: "summary" | "transcripts",
  videoId: string
): string => {
  return `user:${userId}:${type}:${videoId}`;
};
