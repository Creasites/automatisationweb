import { CodecAction, CodecInput, CodecResult, CodecType } from "./types";

function base64Encode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64");
}

function base64Decode(value: string): string {
  try {
    return Buffer.from(value, "base64").toString("utf8");
  } catch {
    throw new Error("INVALID_BASE64");
  }
}

function urlEncode(value: string): string {
  return encodeURIComponent(value);
}

function urlDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    throw new Error("INVALID_URL_ENCODING");
  }
}

function applyCodec(text: string, codec: CodecType, action: CodecAction): string {
  if (codec === "base64") {
    return action === "encode" ? base64Encode(text) : base64Decode(text);
  }

  return action === "encode" ? urlEncode(text) : urlDecode(text);
}

export function runCodec(input: CodecInput): CodecResult {
  const text = input.text;
  if (text.length === 0) {
    throw new Error("TEXT_EMPTY");
  }

  return {
    codec: input.codec,
    action: input.action,
    inputText: text,
    outputText: applyCodec(text, input.codec, input.action),
  };
}