export type PaletteMode = "soft" | "vibrant" | "contrast";

export interface ColorPaletteInput {
  baseColor: string;
  mode: PaletteMode;
}

export interface PaletteColor {
  role: string;
  hex: string;
}

export interface ColorPaletteResult {
  baseColor: string;
  mode: PaletteMode;
  palette: PaletteColor[];
}