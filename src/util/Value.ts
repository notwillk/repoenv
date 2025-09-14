type ValueParams = {
  value?: string;
  secret?: boolean;
};

const REDACTED_VALUE = '*****';

export default class Value {
  private value: string | undefined;
  private secret: boolean | undefined;

  constructor({ value, secret }: ValueParams) {
    this.value = value;
    this.secret = secret;
  }

  static fromString(value: string): Value {
    return new Value({ value });
  }

  toString(): string {
    return this.secret ? REDACTED_VALUE : (this.value ?? '');
  }

  getValue(): string | undefined {
    return this.value;
  }
}
