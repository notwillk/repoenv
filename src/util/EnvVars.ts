import picomatch from 'picomatch';

export function isEnvVars(obj: unknown): obj is EnvVars {
  return obj instanceof EnvVars;
}

function filterVariable(
  varName: string,
  { include, exclude }: { include: string[]; exclude: string[] },
) {
  return picomatch.isMatch(varName, include) && !picomatch.isMatch(varName, exclude);
}

export default class EnvVars {
  protected values: Record<string, string | undefined>;

  constructor(vars?: EnvVars | Record<string, string | undefined>) {
    this.values = { ...(isEnvVars(vars) ? vars.values : vars || {}) };
  }

  has(key: string): boolean {
    return key in this.values;
  }

  get(key: string): string | undefined {
    return this.values[key];
  }

  set(key: string, value: string | undefined): void {
    this.values[key] = value;
  }

  keys(): string[] {
    return Object.keys(this.values);
  }

  entries(): [string, string | undefined][] {
    return Object.entries(this.values);
  }

  toObject(): Record<string, string | undefined> {
    return { ...this.values };
  }

  toDotenv(): string {
    return Object.entries(this.values)
      .map(([key, val]) => `${key}=${val === undefined ? '' : `"${val.replace(/"/g, '\\"')}"`}`)
      .join('\n');
  }

  filter(filters: string[]): EnvVars {
    const parsedFilters = filters.reduce<{ include: string[]; exclude: string[] }>(
      ({ include, exclude }, pattern) =>
        picomatch.scan(pattern).negated
          ? { include, exclude: [...exclude, pattern] }
          : { include: [...include, pattern], exclude },
      { include: [], exclude: [] },
    );

    return new EnvVars(
      Object.fromEntries(
        this.entries().filter(([varName]) => filterVariable(varName, parsedFilters)),
      ),
    );
  }
}
