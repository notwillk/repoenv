import path from 'node:path';

import { getGitRoot } from '@/util/git';
import { CONFIG_FILENAME } from '@/constants';

export default function defaultConfigPath(): string {
  return path.join(getGitRoot()!, CONFIG_FILENAME);
}
