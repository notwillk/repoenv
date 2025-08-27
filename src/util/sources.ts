import z from 'zod';
import SourceSchema from '@/schemas/source';
import readFile from '@/util/readFile';

export function readSourceFile(filePath: string): z.infer<typeof SourceSchema> {
  return readFile(filePath, SourceSchema);
}
