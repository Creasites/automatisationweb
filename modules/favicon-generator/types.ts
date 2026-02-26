export interface FaviconInput {
  letter: string;
  backgroundColor: string;
  textColor: string;
  rounded: boolean;
}

export interface FaviconResult {
  letter: string;
  backgroundColor: string;
  textColor: string;
  rounded: boolean;
  svg: string;
  dataUrl: string;
  htmlSnippet: string;
}