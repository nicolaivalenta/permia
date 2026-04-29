import { canonicalize } from "./canonical.js";
import { ToolManifest } from "./types.js";

export class PermiaSignatureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermiaSignatureError";
  }
}

export type SignedManifest = {
  manifest: ToolManifest;
  signature: string;
  algorithm: "HMAC-SHA-256";
  keyId: string;
  canonicalHash: string;
};

export type ManifestSigner = {
  sign(manifest: ToolManifest, secret: string, keyId?: string): Promise<SignedManifest>;
};

export type ManifestVerifier = {
  verify(signed: SignedManifest, secret: string): Promise<{ ok: boolean; reason: string }>;
};

function base64(bytes: ArrayBuffer) {
  return Buffer.from(bytes).toString("base64url");
}

async function importHmacKey(secret: string, usage: KeyUsage[]) {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, usage);
}

export const nativeManifestSigner: ManifestSigner = {
  async sign(manifest, secret, keyId = "local-dev") {
    const bytes = new TextEncoder().encode(canonicalize(manifest));
    const key = await importHmacKey(secret, ["sign"]);
    const signature = await crypto.subtle.sign("HMAC", key, bytes);
    const canonicalHashBuffer = await crypto.subtle.digest("SHA-256", bytes);
    return {
      manifest,
      signature: base64(signature),
      algorithm: "HMAC-SHA-256",
      keyId,
      canonicalHash: base64(canonicalHashBuffer),
    };
  },
};

export const nativeManifestVerifier: ManifestVerifier = {
  async verify(signed, secret) {
    const key = await importHmacKey(secret, ["verify"]);
    const ok = await crypto.subtle.verify(
      "HMAC",
      key,
      Buffer.from(signed.signature, "base64url"),
      new TextEncoder().encode(canonicalize(signed.manifest))
    );
    return { ok, reason: ok ? "signature_valid" : "signature_mismatch" };
  },
};

export const fallbackManifestSigner: ManifestSigner = nativeManifestSigner;
export const fallbackManifestVerifier: ManifestVerifier = nativeManifestVerifier;

export async function signManifest(manifest: ToolManifest, secret: string, options: { keyId?: string; signer?: ManifestSigner } = {}) {
  return (options.signer ?? nativeManifestSigner).sign(manifest, secret, options.keyId);
}

export async function verifySignedManifest(
  signed: SignedManifest,
  secret: string,
  options: { verifier?: ManifestVerifier } = {}
) {
  if (signed.algorithm !== "HMAC-SHA-256") throw new PermiaSignatureError(`Unsupported algorithm ${signed.algorithm}`);
  return (options.verifier ?? nativeManifestVerifier).verify(signed, secret);
}
