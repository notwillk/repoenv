import { resolve } from 'node:path';

export const CLI_PATH = resolve(__dirname, '..', '..', 'dist', 'index.cjs');
export const BAD_COMMAND = 'no-such-command';
