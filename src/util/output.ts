import { EnvVars } from '@/types/EnvVars';
import logger from './logger';

type OutputFormat = 'json' | 'dotenv';

type Options = {
  format?: OutputFormat;
  keysOnly?: boolean;
};

function encodeAsDoubleQuoteString(str: string): string {
  return `"${str.replace(/"/g, '\\"')}"`;
}

export function outputAsDotenv(value: EnvVars): void {
  for (const [key, val] of Object.entries(value)) {
    console.log(`${key}=${val === undefined ? '' : encodeAsDoubleQuoteString(val)}`);
  }
}

export function outputAsJson(value: EnvVars): void {
  console.log(JSON.stringify(value, null, 0));
}

export default function output(value: EnvVars, { format = 'dotenv', keysOnly }: Options): void {
  if (keysOnly === true) {
    const keys = Object.keys(value);
    console.log(format === 'json' ? JSON.stringify(keys, null, 0) : keys.join(','));
  } else {
    switch (format) {
      case 'dotenv':
        logger.debug('Output format: dotenv');
        outputAsDotenv(value);
        break;
      case 'json':
        logger.debug('Output format: json');
        outputAsJson(value);
        break;
      default:
        throw new Error(`Unsupported output format: ${format}`);
    }
  }
}
