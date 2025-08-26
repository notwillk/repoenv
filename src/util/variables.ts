import z from 'zod';
import VariablesSchema from '../schemas/variables';
import readFile from './readFile';

export function readVariablesFile(filePath: string): z.infer<typeof VariablesSchema> {
  return readFile(filePath, VariablesSchema);
}
