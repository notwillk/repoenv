import { execa } from 'execa';

type Options = {
  value: string | undefined;
  command?: string;
};

export default async function externalValidate({ value, command }: Options): Promise<boolean> {
  if (!command) return true;

  try {
    const { exitCode } = await execa(command, { input: value });
    return exitCode === 0;
  } catch {
    return false;
  }
}
