import { execSync } from 'node:child_process';
import CommandSubstitutionError from '@/errors/CommandSubstitutionError';
import { SubstitutionVariable } from '@/schemas/versions/variable';
import EnvVars from '@/util/EnvVars';
import { env } from 'string-env-interpolation';
import logger from './logger';

type Options = {
  def: SubstitutionVariable;
  cwd: string;
  envVars: EnvVars;
};

export default function getSubstitutedValue({ def, cwd, envVars }: Options): string {
  logger.debug(`Substituting command: ${def.substitution}`);
  const command = env(def.substitution, envVars.toObject());

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
