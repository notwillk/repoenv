import picomatch from 'picomatch';

function parsedFilters(filters: string[]): { include: string[]; exclude: string[] } {
  return filters.reduce<{ include: string[]; exclude: string[] }>(
    ({ include, exclude }, pattern) =>
      picomatch.scan(pattern).negated
        ? { include, exclude: [...exclude, pattern] }
        : { include: [...include, pattern], exclude },
    { include: [], exclude: [] },
  );
}

export default function getVariableNameFilter(filters: string[]) {
  const { include, exclude } = parsedFilters(filters);

  return function (varName: string) {
    return picomatch.isMatch(varName, include) && !picomatch.isMatch(varName, exclude);
  };
}
