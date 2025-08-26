import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import * as yaml from 'yaml';

import { getGitRoot } from './git';
import ConfigSchema from '../schemas/config';
import output from './output';
import { CONFIG_FILENAME } from '../constants';

function readOrThrow(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    output.error(({ red }) => `Failed to read file: ${red(filePath)}`);
    throw err;
  }
}

class Config {
  configPath: string | null = null;
  data: z.infer<typeof ConfigSchema> | null = null;

  load(env?: string): void {
    const configPath = env
      ? path.resolve(process.cwd(), env)
      : path.join(getGitRoot()!, CONFIG_FILENAME);

    output.debug(`Config file: ${configPath}`);

    if (!fs.existsSync(configPath)) {
      output.error(({ red }) => `Config file not found: ${red(configPath)}`);
      throw new Error(`Config file not found: ${configPath}`);
    }

    const rawConfig = readOrThrow(configPath);
    const parsedYamlConfig = yaml.parse(rawConfig);
    this.data = ConfigSchema.parse(parsedYamlConfig);
    this.configPath = configPath;
  }
}

export default new Config();
