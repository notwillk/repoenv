type ValueParams = {
  value?: string;
  redact?: boolean;
};

const REDACTED_VALUE = '*****';

export default class Value {
  private value: string | undefined;
  private redact: boolean | undefined;

  constructor({ value, redact }: ValueParams) {
    this.value = value;
    this.redact = redact;
  }

  static fromString(value: string): Value {
    return new Value({ value });
  }

  toString(options: { ignoreRedaction?: boolean } = {}): string {
    return this.redact && !options.ignoreRedaction ? REDACTED_VALUE : (this.value ?? '');
  }

  getValue(): string | undefined {
    return this.value;
  }
}
