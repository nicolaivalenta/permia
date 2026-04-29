import { sha256Hex } from "./canonical.js";

export type ReplayCacheKeyInput = {
  fixtureVersion: string;
  fixtureId: string;
  manifestHash: string;
  policyVersion: string;
  engineVersion: string;
};

export async function replayCacheKey(input: ReplayCacheKeyInput) {
  return `replay_${(await sha256Hex(input)).slice(0, 24)}`;
}

export class MemoryContentCache<Value> {
  private readonly values = new Map<string, Value>();

  get(key: string) {
    return this.values.get(key);
  }

  set(key: string, value: Value) {
    this.values.set(key, value);
    return value;
  }

  clear() {
    this.values.clear();
  }
}
