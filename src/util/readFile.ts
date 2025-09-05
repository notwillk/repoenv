import fs from 'node:fs';
import { z } from 'zod';
import * as yaml from 'yaml';

import logger from '@/util/logger';

function readOrThrow(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    logger.error(({ red }) => `Failed to read file: ${red(filePath)}`);
    throw err;
  }
}

export default function readFile<T extends z.ZodTypeAny>(filePath: string, schema: T): z.output<T> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const rawConfig = readOrThrow(filePath);
  const parsedYamlConfig = yaml.parse(rawConfig);

  return schema.parse(parsedYamlConfig);
}
