import { createHash, randomBytes } from "node:crypto";

export const MICROSOFT_ENCRYPTION_CONFIG_ERROR = "microsoft_encryption_secret_required";

async function runtimeSecret() {
  const fromProcess = process.env.MICROSOFT_TOKEN_ENCRYPTION_SECRET
    || process.env.AUTH_SECRET
    || process.env.NEXTAUTH_SECRET;
  if (String(fromProcess || "").trim()) return String(fromProcess).trim();
  try {
    const mod = await import("@opennextjs/cloudflare");
    const context = await mod.getCloudflareContext({ async: true });
    const fromCloudflare = String(
      (context.env as any).MICROSOFT_TOKEN_ENCRYPTION_SECRET
        || (context.env as any).AUTH_SECRET
        || (context.env as any).NEXTAUTH_SECRET
        || "",
    ).trim();
    if (fromCloudflare) return fromCloudflare;
  } catch {
    // Fall through to the fail-closed error below.
  }
  throw new Error(MICROSOFT_ENCRYPTION_CONFIG_ERROR);
}

async function deriveCryptoKey(secret: string) {
  const digest = createHash("sha256").update(secret).digest();
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export function randomUrlToken(byteLength = 32) {
  return randomBytes(byteLength).toString("base64url");
}

export function sha256Hex(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function sha256Base64Url(value: string) {
  return createHash("sha256").update(value).digest("base64url");
}

export async function encryptMicrosoftSecret(value: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveCryptoKey(await runtimeSecret());
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(value));
  return `${Buffer.from(iv).toString("base64")}.${Buffer.from(encrypted).toString("base64")}`;
}

export async function decryptMicrosoftSecret(value: string) {
  const [ivPart, encryptedPart] = value.split(".");
  if (!ivPart || !encryptedPart) return "";
  const key = await deriveCryptoKey(await runtimeSecret());
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: Uint8Array.from(Buffer.from(ivPart, "base64")) },
    key,
    Buffer.from(encryptedPart, "base64"),
  );
  return new TextDecoder().decode(decrypted);
}
