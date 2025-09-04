import path from 'node:path';
import fs from 'node:fs';
import { z } from 'zod';

import { getGitRoot } from '@/util/git';
import ConfigSchema from '@/schemas/config';
import logger from '@/util/logger';
import { CONFIG_FILENAME } from '@/constants';
import readFile from '@/util/readFile';

class Config {
  configPath: string | null = null;
  data: z.infer<typeof ConfigSchema> | null = null;

  load(env?: string): void {
    const useDefaultConfigFile = !env;

    const configPath = useDefaultConfigFile
      ? path.join(getGitRoot()!, CONFIG_FILENAME)
      : path.resolve(process.cwd(), env);

    logger.debug(`Config file: ${configPath}`);

    if (!useDefaultConfigFile || fs.existsSync(configPath)) {
      this.data = readFile(configPath, ConfigSchema);
    } else {
      logger.warn(`Config file not found`);
    }

    this.configPath = configPath;
  }
}

export default new Config();
