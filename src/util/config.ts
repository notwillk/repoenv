import path from 'node:path';
import fs from 'node:fs';
import { z } from 'zod';

import ConfigSchema from '@/schemas/config';
import logger from '@/util/logger';
import readFile from '@/util/readFile';
import defaultConfigPath from './defaultConfigPath';

function makeAbsolutePath(relativeOrAbsolutePath: string): string {
  if (path.isAbsolute(relativeOrAbsolutePath)) {
    return relativeOrAbsolutePath;
  }
  return path.resolve(process.cwd(), relativeOrAbsolutePath);
}

class Config {
  configPath: string | null = null;
  data: z.infer<typeof ConfigSchema> | null = null;
  sources: Record<string, string> = {};

  load(env?: string): void {
    const useDefaultConfigFile = !env;

    const configPath = useDefaultConfigFile
      ? defaultConfigPath()
      : path.resolve(process.cwd(), env);

    logger.debug(`Config file: ${configPath}`);

    if (!useDefaultConfigFile || fs.existsSync(configPath)) {
      this.data = readFile(configPath, ConfigSchema);
    } else {
      logger.warn(`Config file not found`);
    }

    this.configPath = configPath;
    this.sources = Object.fromEntries(
      Object.entries(this.data?.services || {}).map(([serviceName, servicePath]) => [
        serviceName,
        makeAbsolutePath(servicePath),
      ]),
    );
  }
}

export default new Config();
