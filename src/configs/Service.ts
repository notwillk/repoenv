import fs from 'node:fs';
import { z } from 'zod';

import ServiceSchema from '@/schemas/service';
import logger from '@/util/logger';
import readFile from '@/util/readFile';

export default class Service {
  path: string | null = null;
  data: z.infer<typeof ServiceSchema> | null = null;

  load(path: string): void {
    logger.debug(`Service file: ${path}`);

    if (fs.existsSync(path)) {
      this.data = readFile(path, ServiceSchema);
    } else {
      logger.warn(`Config file not found: ${path}`);
    }

    this.path = path;
  }

  static fromJson(json: unknown): Service {
    const service = new Service();
    service.data = ServiceSchema.parse(json);
    return service;
  }
}
