export class PermiaCanonicalizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermiaCanonicalizationError";
  }
}

type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}

function normalize(value: unknown, path = "$"): JsonValue {
  if (value === null) return null;
  if (typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new PermiaCanonicalizationError(`Non-finite number at ${path}`);
    return Object.is(value, -0) ? 0 : value;
  }
  if (Array.isArray(value)) return value.map((item, index) => normalize(item, `${path}[${index}]`));
  if (isPlainObject(value)) {
    return Object.keys(value)
      .sort()
      .reduce<Record<string, JsonValue>>((result, key) => {
        const next = value[key];
        if (next === undefined || typeof next === "function" || typeof next === "symbol" || typeof next === "bigint") {
          throw new PermiaCanonicalizationError(`Unsupported value at ${path}.${key}`);
        }
        result[key] = normalize(next, `${path}.${key}`);
        return result;
      }, {});
  }
  throw new PermiaCanonicalizationError(`Unsupported value at ${path}`);
}

export function canonicalize(value: unknown): string {
  return JSON.stringify(normalize(value));
}

export async function sha256Hex(value: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(typeof value === "string" ? value : canonicalize(value));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
