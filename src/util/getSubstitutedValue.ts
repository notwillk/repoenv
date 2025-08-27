import { execSync } from 'node:child_process';
import CommandSubstitutionError from '../errors/CommandSubstitutionError';

type Options = {
  command: string;
  cwd: string;
};

export default function getSubstitutedValue({ command, cwd }: Options): string {
  try {
    const out = execSync(command, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024, // 10MB, tweak as needed
    });
    return out.trimEnd();
  } catch (err: any) {
    throw new CommandSubstitutionError({
      command,
      stderr: (err?.stderr?.toString?.() ?? err?.message ?? '').trim(),
      status: err?.status ?? err?.code,
    });
  }
}
