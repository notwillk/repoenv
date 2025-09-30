import path from 'node:path';
import fs from 'node:fs';
import { z } from 'zod';

import ConfigSchema from '@/schemas/config';
import logger from '@/util/logger';
import readFile from '@/util/readFile';
import defaultConfigPath from '../util/defaultConfigPath';
import makeAbsolutePath from '@/util/makeAbsolutePath';
import Service from './Service';

class Config {
  configPath: string | null = null;
  data: z.infer<typeof ConfigSchema> | null = null;
  sources: Record<string, string> = {};
  services: Record<string, Service> = {};

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
    this.services = Object.fromEntries(
      Object.entries(this.data?.services || {}).map(([serviceName, servicePath]) => {
        const service = new Service();
        service.load(makeAbsolutePath(servicePath));

        return [serviceName, service];
      }),
    );
  }

  static fromJson(json: unknown, serviceJsons: Record<string, unknown>): Config {
    const config = new Config();
    config.data = ConfigSchema.parse(json);

    Object.keys(config.data.services).forEach((serviceName) => {
      if (!(serviceName in serviceJsons)) {
        throw new Error(`Service JSON for '${serviceName}' is required`);
      }

      config.services[serviceName] = Service.fromJson(serviceJsons[serviceName]);
    });

    return config;
  }
}

export default new Config();
