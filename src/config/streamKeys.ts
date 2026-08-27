import { env } from "./env";

const registry = new Map<string, string>();

for (const entry of env.streamKeys.split(",")) {
  const [key, owner] = entry.split(":").map((s) => s.trim());
  if (key) registry.set(key, owner || key);
}

export function isValidStreamKey(streamKey: string): boolean {
  return registry.has(streamKey);
}

export function getStreamOwner(streamKey: string): string | undefined {
  return registry.get(streamKey);
}
