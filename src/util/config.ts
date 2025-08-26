import path from 'node:path';
import { z } from 'zod';

import { getGitRoot } from './git';
import ConfigSchema from '../schemas/config';
import output from './output';
import { CONFIG_FILENAME } from '../constants';
import readFile from './readFile';

class Config {
  configPath: string | null = null;
  data: z.infer<typeof ConfigSchema> | null = null;

  load(env?: string): void {
    const configPath = env
      ? path.resolve(process.cwd(), env)
      : path.join(getGitRoot()!, CONFIG_FILENAME);

    output.debug(`Config file: ${configPath}`);

    this.data = readFile(configPath, ConfigSchema);
    this.configPath = configPath;
  }
}

export default new Config();
