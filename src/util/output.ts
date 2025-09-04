import logger from './logger';

type OutputFormat = 'json' | 'dotenv';

type Options = {
  format?: OutputFormat;
};

function encodeAsDoubleQuoteString(str: string): string {
  return `"${str.replace(/"/g, '\\"')}"`;
}

export function outputAsDotenv(value: Record<string, string | undefined>): void {
  for (const [key, val] of Object.entries(value)) {
    console.log(`${key}=${val === undefined ? '' : encodeAsDoubleQuoteString(val)}`);
  }
}

export function outputAsJson(value: Record<string, string | undefined>): void {
  console.log(JSON.stringify(value, null, 0));
}

export default function output(
  value: Record<string, string | undefined>,
  { format = 'dotenv' }: Options,
): void {
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
