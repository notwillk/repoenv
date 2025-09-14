import { execSync } from 'node:child_process';

const outputs = new Map<string, string | null>();

export function getGitRoot(cwd = process.cwd()): string | null {
  if (outputs.has(cwd)) {
    return outputs.get(cwd)!;
  }

  try {
    outputs.set(cwd, execSync('git rev-parse --show-toplevel', { cwd, encoding: 'utf8' }).trim());
  } catch {
    outputs.set(cwd, null);
  }

  return outputs.get(cwd)!;
}
