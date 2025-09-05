import { execSync } from 'node:child_process';
import CommandSubstitutionError from '@/errors/CommandSubstitutionError';

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
  } catch (err: unknown) {
    const mappedErr = err as Error & {
      stderr?: unknown;
      status?: unknown;
      code?: unknown;
    };

    const stderr = (mappedErr?.stderr?.toString?.() ?? mappedErr?.message ?? '').trim();
    const status = mappedErr?.status ?? mappedErr?.code;

    throw new CommandSubstitutionError({
      command,
      stderr,
      status,
    });
  }
}
