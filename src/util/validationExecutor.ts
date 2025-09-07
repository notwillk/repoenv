import { spawnSync } from 'node:child_process';

type Options = {
  command: string;
  value: string;
};

type Result = {
  ok: boolean;
  error: string | null;
};

export default function validationExecutor({ value, command }: Options): Result {
  let error: string | null = null;

  const result = spawnSync(command, {
    input: value,
    shell: true,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  const ok = result.status === 0;

  if (!ok) {
    error =
      [
        result.stderr?.toString?.().trim(),
        result.error?.message,
        result.status && `Command failed with status code ${result.status}`,
      ].find(Boolean) || null;
  }

  return { ok, error };
}
