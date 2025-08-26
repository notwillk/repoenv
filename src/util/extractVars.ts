import { ENV_VAR_NAME_PATTERN } from '../constants';

export default function extractVars(input: string): string[] {
  const regex = new RegExp(`\\$(${ENV_VAR_NAME_PATTERN})`, 'g');
  const matches: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(input)) !== null) {
    matches.push(m[1]);
  }
  return matches;
}
