export function isEnvVars(obj: unknown): obj is EnvVars {
  return obj instanceof EnvVars;
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
}
