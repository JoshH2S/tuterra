export type FileType = 'pdf' | 'word' | 'text';

export interface ProcessedFile {
  content: string;
  wasContentTrimmed: boolean;
  originalLength: number;
  fileType: FileType;
}