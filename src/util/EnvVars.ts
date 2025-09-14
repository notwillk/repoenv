import picomatch from 'picomatch';
import Value from './Value';

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
  protected values: Record<string, Value>;

  constructor(vars?: EnvVars | Record<string, Value>) {
    this.values = { ...(isEnvVars(vars) ? vars.values : vars || {}) };
  }

  has(key: string): boolean {
    return key in this.values;
  }

  get(key: string): Value {
    return this.values[key];
  }

  set(key: string, value: Value): void {
    this.values[key] = value;
  }

  keys(): string[] {
    return Object.keys(this.values);
  }

  entries(): [string, Value][] {
    return Object.entries(this.values);
  }

  toObject(): Record<string, string | undefined> {
    return Object.fromEntries(
      Object.entries(this.values).map(([key, val]) => [key, val.getValue()]),
    );
  }

  toDotenv(): string {
    return Object.entries(this.values)
      .map(
        ([key, variable]) =>
          `${key}=${variable === undefined ? '' : `"${variable?.getValue()?.replace(/"/g, '\\"')}"`}`,
      )
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
  static fromObject(obj: Record<string, string | undefined>): EnvVars {
    return new EnvVars(
      Object.fromEntries(Object.entries(obj).map(([key, val]) => [key, new Value({ value: val })])),
    );
  }
}
