import EnvVars from '@/util/EnvVars';
import logger from './logger';

export type OutputFormat = 'json' | 'dotenv';

type Options = {
  format?: OutputFormat;
  keysOnly?: boolean;
};

export default function output(envVars: EnvVars, { format = 'dotenv', keysOnly }: Options): void {
  if (keysOnly === true) {
    const keys = envVars.keys();
    console.log(format === 'json' ? JSON.stringify(keys, null, 0) : keys.join(','));
  } else {
    switch (format) {
      case 'dotenv':
        logger.debug('Output format: dotenv');
        console.log(envVars.toDotenv());
        break;
      case 'json':
        logger.debug('Output format: json');
        console.log(JSON.stringify(envVars.toObject(), null, 0));
        break;
      default:
        throw new Error(`Unsupported output format: ${format}`);
    }
  }
}
