import Redis from "ioredis";

const redis = new Redis();

export async function getRedis(key: string) {
  const a = await redis.get(key);
  return JSON.parse(a);
}

export function setRedis(key: string, value: object) {
  const val = JSON.stringify(value);
  return redis.set(key, val);
}

export function delRedis(key: string) {
  return redis.del(key);
}
