export type QrOutputFormat = "png";

export interface QrCodeInput {
  text: string;
  size?: number;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
}

export interface QrCodeResult {
  text: string;
  size: number;
  margin: number;
  format: QrOutputFormat;
  imageUrl: string;
}