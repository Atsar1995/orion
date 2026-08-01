import type { SessionTokenPayload } from "@/lib/identity/types";
import { UserStatus } from "@/types/auth";
import type { Session } from "@/types/auth";

function encodeBase64Url(value: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "utf8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/u, "");
  }

  const bytes = new TextEncoder().encode(value);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);

  if (typeof Buffer !== "undefined") {
    return Buffer.from(padded, "base64").toString("utf8");
  }

  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/** Signs a session payload into a tamper-evident token (Edge-compatible). */
export async function signSessionToken(
  payload: SessionTokenPayload,
  secret: string,
): Promise<string> {
  const body = encodeBase64Url(JSON.stringify(payload));
  const key = await importHmacKey(secret);
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  const signature = encodeBase64Url(
    String.fromCharCode(...new Uint8Array(signatureBuffer)),
  );

  return `${body}.${signature}`;
}

/** Verifies and decodes a session token. Returns null when invalid or expired. */
export async function verifySessionToken(
  token: string,
  secret: string,
): Promise<SessionTokenPayload | null> {
  const [body, signature] = token.split(".");

  if (!body || !signature) {
    return null;
  }

  try {
    const key = await importHmacKey(secret);
    const signatureBytes = Uint8Array.from(decodeBase64Url(signature), (char) =>
      char.charCodeAt(0),
    );
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      new TextEncoder().encode(body),
    );

    if (!valid) {
      return null;
    }

    const payload = JSON.parse(decodeBase64Url(body)) as SessionTokenPayload;

    if (payload.exp * 1000 <= Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/** Maps a token payload to an ORION {@link Session}. */
export function payloadToSession(
  payload: SessionTokenPayload,
  workspace: Session["activeWorkspace"],
): Session {
  return {
    user: {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      status: UserStatus.Active,
      organizationId: payload.organizationId,
      workspaceId: payload.workspaceId,
      role: payload.role,
      permissions: payload.permissions,
      createdAt: new Date(payload.iat * 1000),
      updatedAt: new Date(payload.iat * 1000),
    },
    activeWorkspace: workspace,
    expiresAt: new Date(payload.exp * 1000),
  };
}
