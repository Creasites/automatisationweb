import { SESSION_TTL_SECONDS } from "./constants";

export type SessionPayload = {
  email: string;
  trialEndsAt: string;
  subscriptionStatus: "inactive" | "active";
};

const rawSessionSecret = process.env.SESSION_SECRET;

if (process.env.NODE_ENV === "production" && !rawSessionSecret) {
  throw new Error("SESSION_SECRET manquant en production");
}

const secret = new TextEncoder().encode(
  rawSessionSecret ?? "dev-only-secret-change-me"
);

type JwtPayload = SessionPayload & {
  exp: number;
  iat: number;
};

function toBase64(input: Uint8Array | string) {
  if (typeof input === "string") {
    if (typeof btoa === "function") {
      return btoa(input);
    }
    return Buffer.from(input, "binary").toString("base64");
  }

  let binary = "";
  for (const byte of input) {
    binary += String.fromCharCode(byte);
  }

  if (typeof btoa === "function") {
    return btoa(binary);
  }

  return Buffer.from(binary, "binary").toString("base64");
}

function fromBase64(base64: string) {
  if (typeof atob === "function") {
    return atob(base64);
  }
  return Buffer.from(base64, "base64").toString("binary");
}

function toBase64UrlFromString(input: string) {
  return toBase64(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function toBase64UrlFromBytes(input: Uint8Array) {
  return toBase64(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(input: string) {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  return fromBase64(base64);
}

async function signData(data: string) {
  const key = await crypto.subtle.importKey("raw", secret, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return toBase64UrlFromBytes(new Uint8Array(signature));
}

async function verifySignature(data: string, signature: string) {
  const expected = await signData(data);
  return expected === signature;
}

export async function createSessionToken(payload: SessionPayload) {
  const now = Math.floor(Date.now() / 1000);
  const jwtPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };

  const header = toBase64UrlFromString(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = toBase64UrlFromString(JSON.stringify(jwtPayload));
  const signature = await signData(`${header}.${body}`);

  return `${header}.${body}.${signature}`;
}

export async function verifySessionToken(token: string) {
  const [header, body, signature] = token.split(".");

  if (!header || !body || !signature) {
    throw new Error("Session invalide");
  }

  const isValid = await verifySignature(`${header}.${body}`, signature);
  if (!isValid) {
    throw new Error("Session invalide");
  }

  const payload = JSON.parse(fromBase64Url(body)) as JwtPayload;

  if (!payload?.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
    throw new Error("Session expirée");
  }

  if (!payload?.email || !payload?.trialEndsAt || !payload?.subscriptionStatus) {
    throw new Error("Session invalide");
  }

  return {
    email: payload.email,
    trialEndsAt: payload.trialEndsAt,
    subscriptionStatus: payload.subscriptionStatus,
  };
}
