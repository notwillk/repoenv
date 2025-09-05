import SourceSchema, { Source } from '@/schemas/source';
import readFile from '@/util/readFile';

export function readSourceFile(filePath: string): Source {
  return readFile(filePath, SourceSchema);
}
