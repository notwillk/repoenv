import { execSync } from 'node:child_process';

export function getGitRoot(cwd = process.cwd()): string | null {
  try {
    return execSync('git rev-parse --show-toplevel', { cwd, encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}
