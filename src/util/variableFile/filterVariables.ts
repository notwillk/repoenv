import picomatch from 'picomatch';

import { EnvVars } from '../../types/EnvVars';

type Options = { envVars: EnvVars; filters: string[] };

function filterVariable(
  varName: string,
  { include, exclude }: { include: string[]; exclude: string[] },
) {
  return picomatch.isMatch(varName, include) && !picomatch.isMatch(varName, exclude);
}

export default function filterVariables({ envVars, filters }: Options): EnvVars {
  const parsedFilters = filters.reduce<{ include: string[]; exclude: string[] }>(
    ({ include, exclude }, pattern) =>
      picomatch.scan(pattern).negated
        ? { include, exclude: [...exclude, pattern] }
        : { include: [...include, pattern], exclude },
    { include: [], exclude: [] },
  );

  return Object.fromEntries(
    Object.entries(envVars).filter(([varName]) => filterVariable(varName, parsedFilters)),
  );
}
