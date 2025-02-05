export interface FileType {
  name: string;
  size: number;
}

export interface ProcessedFile {
  content: string;
  wasContentTrimmed: boolean;
  originalLength: number;
}