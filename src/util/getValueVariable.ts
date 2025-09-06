import { ValueVariable } from '@/schemas/versions/variable';
import { EnvVars } from '@/types/EnvVars';
import { env } from 'string-env-interpolation';

type Options = {
  def: ValueVariable;
  envVars: EnvVars;
};

export default function getValueVariable({ def, envVars }: Options): string {
  return env(def.value, envVars);
}
