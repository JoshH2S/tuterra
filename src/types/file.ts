export interface FileType {
  name: string;
  size: number;
}

export interface StorageFile extends FileType {
  path: string;
  type: string;
}

export interface ProcessedFile {
  content: string;
  wasContentTrimmed: boolean;
  originalLength: number;
}