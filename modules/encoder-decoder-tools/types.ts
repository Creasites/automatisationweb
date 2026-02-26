export type CodecType = "base64" | "url";

export type CodecAction = "encode" | "decode";

export interface CodecInput {
  text: string;
  codec: CodecType;
  action: CodecAction;
}

export interface CodecResult {
  codec: CodecType;
  action: CodecAction;
  inputText: string;
  outputText: string;
}