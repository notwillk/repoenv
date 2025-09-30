import fs from 'node:fs';
import { z } from 'zod';

import SourceSchema from '@/schemas/source';
import logger from '@/util/logger';
import readFile from '@/util/readFile';

export default class Service {
  path: string | null = null;
  data: z.infer<typeof SourceSchema> | null = null;

  load(path: string): void {
    logger.debug(`Service file: ${path}`);

    if (!fs.existsSync(path)) {
      this.data = readFile(path, SourceSchema);
    } else {
      logger.warn(`Config file not found`);
    }

    this.path = path;
  }

  static fromJson(json: unknown): Service {
    const source = new Service();
    source.data = SourceSchema.parse(json);
    return source;
  }
}
