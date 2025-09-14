import validators from './validators';

export const STATIC_FORMATS = ['url', 'iso8601', 'email', 'ipv4', 'ipv6', 'uuid', 'ulid'] as const;
export const INTEGER_MODIFIED_FORMATS = ['string', 'base64', 'hex', 'integer'] as const;
export const FLOAT_MODIFIED_FORMATS = ['float'] as const;
export const SUPORTED_FORMATS = {
  staticFormats: STATIC_FORMATS,
  integerModifiedFormats: INTEGER_MODIFIED_FORMATS,
  floatModifiedFormats: FLOAT_MODIFIED_FORMATS,
} as const;

export type FormatType =
  | (typeof STATIC_FORMATS)[number]
  | (typeof INTEGER_MODIFIED_FORMATS)[number]
  | (typeof FLOAT_MODIFIED_FORMATS)[number];

type ParsedStaticFormat = {
  type: FormatType;
  hasModifier: false;
};

type ParsedModifiedFormat = {
  type: FormatType;
  hasModifier: true;
  minIncluded: boolean;
  maxIncluded: boolean;
} & ({ min?: number; max: number } | { min: number; max?: number });

type Prettify<T> = { [K in keyof T]: T[K] } & {};

export function isFormatType(s: string): s is FormatType {
  return (
    STATIC_FORMATS.includes(s as (typeof STATIC_FORMATS)[number]) ||
    INTEGER_MODIFIED_FORMATS.includes(s as (typeof INTEGER_MODIFIED_FORMATS)[number]) ||
    FLOAT_MODIFIED_FORMATS.includes(s as (typeof FLOAT_MODIFIED_FORMATS)[number])
  );
}

function isParsedModifiedFormat(
  format: Prettify<ParsedStaticFormat | ParsedModifiedFormat> | ParsedFormat,
): format is ParsedModifiedFormat {
  return format.hasModifier;
}

export default class ParsedFormat {
  type: FormatType;
  hasModifier: boolean;
  minIncluded: boolean | undefined;
  maxIncluded: boolean | undefined;
  min: number | undefined;
  max: number | undefined;

  constructor(initialValue: Prettify<ParsedStaticFormat | ParsedModifiedFormat>) {
    this.type = initialValue.type;
    this.hasModifier = initialValue.hasModifier;

    if (isParsedModifiedFormat(initialValue)) {
      this.minIncluded = initialValue.minIncluded;
      this.maxIncluded = initialValue.maxIncluded;
      this.min = initialValue.min;
      this.max = initialValue.max;
    }
  }

  tooLow(x: number | null): boolean {
    if (isParsedModifiedFormat(this)) {
      if (x === null) return false;
      return this.min === undefined ? false : this.minIncluded ? x < this.min : x <= this.min;
    }

    return false;
  }

  tooHigh(x: number | null): boolean {
    if (isParsedModifiedFormat(this)) {
      if (x === null) return false;
      return this.max === undefined ? false : this.maxIncluded ? x > this.max : x >= this.max;
    }

    return false;
  }

  validate(value: string): boolean {
    const { validator, numericalValue } = validators[this.type];
    const basicallyValid = validator(value);

    return basicallyValid
      ? !this.tooLow(numericalValue(value)) && !this.tooHigh(numericalValue(value))
      : false;
  }
}
