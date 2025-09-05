import SourceSchema from '@/schemas/source';
import readFile from '@/util/readFile';
import { Source } from '@/types/Source';

export function readSourceFile(filePath: string): Source {
  return readFile(filePath, SourceSchema);
}
