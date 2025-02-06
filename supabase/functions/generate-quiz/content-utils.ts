
import { MAX_CHUNK_SIZE } from './constants.ts';

export function chunkContent(content: string): string[] {
  const chunks: string[] = [];
  let currentChunk = '';
  const paragraphs = content.split(/\n\s*\n/);

  for (const paragraph of paragraphs) {
    if ((currentChunk.length + paragraph.length) < MAX_CHUNK_SIZE) {
      currentChunk += paragraph + '\n\n';
    } else {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = paragraph + '\n\n';
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
