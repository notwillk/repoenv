import ParsedFormat, { isFormatType } from './ParsedFormat';

const reEscape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const joinAlt = (arr: readonly string[]) => arr.map(reEscape).join('|');

type Formats = {
  staticFormats: readonly string[];
  integerModifiedFormats: readonly string[];
  floatModifiedFormats: readonly string[];
};

export const INTEGER_PATTERN = '[+-]?\\d+';
export const FLOAT_PATTERN = '[+-]?\\d+(?:\\.\\d*)?';

export const INTEGER_ONLY_MIN_PATTERN = `(?<intOnlyMin>${INTEGER_PATTERN})`;
export const INTEGER_ONLY_MAX_PATTERN = `(?:,(?<intOnlyMax>${INTEGER_PATTERN}))`;
export const INTEGER_RANGE_PATTERN = `(?:(?<intMin>${INTEGER_PATTERN}),(?<intMax>${INTEGER_PATTERN}))`;
export const INTEGER_MODIFIER_PATTERN = `(${[
  INTEGER_ONLY_MIN_PATTERN,
  INTEGER_ONLY_MAX_PATTERN,
  INTEGER_RANGE_PATTERN,
].join('|')})`;

export const FLOAT_ONLY_MIN_PATTERN = `(?<floatOnlyMin>${FLOAT_PATTERN})`;
export const FLOAT_ONLY_MAX_PATTERN = `(?:,(?<floatOnlyMax>${FLOAT_PATTERN}))`;
export const FLOAT_RANGE_PATTERN = `(?:(?<floatMin>${FLOAT_PATTERN}),(?<floatMax>${FLOAT_PATTERN}))`;
export const FLOAT_MODIFIER_PATTERN = `(${[
  FLOAT_ONLY_MIN_PATTERN,
  FLOAT_ONLY_MAX_PATTERN,
  FLOAT_RANGE_PATTERN,
].join('|')})`;

export function getRangePattern(rangePattern: string) {
  return `(?:[\\[(]${rangePattern}[\\])])`;
}

export function getStaticPattern(formats: readonly string[]) {
  return `(?<staticType>(${joinAlt(formats)}))`;
}

export function getIntegerModifiedPattern(formats: readonly string[]) {
  return `(?<intType>(${joinAlt(formats)}))${getRangePattern(INTEGER_MODIFIER_PATTERN)}`;
}

export function getFloatModifiedPattern(formats: readonly string[]) {
  return `(?<floatType>(${joinAlt(formats)}))${getRangePattern(FLOAT_MODIFIER_PATTERN)}`;
}

export function getFormatRegex({
  staticFormats,
  integerModifiedFormats,
  floatModifiedFormats,
}: Formats) {
  return new RegExp(
    `^(?:${[
      getStaticPattern([...staticFormats, ...integerModifiedFormats, ...floatModifiedFormats]),
      getIntegerModifiedPattern([...integerModifiedFormats, ...floatModifiedFormats]),
      getFloatModifiedPattern(floatModifiedFormats),
    ].join('|')})$`,
  );
}

export function parseFormat(maybeFormat: string, formats: Formats): ParsedFormat | null {
  const re = getFormatRegex(formats);
  const match = re.exec(maybeFormat);
  if (!match || !match.groups) return null;

  const minIncluded = match[0].includes('[');
  const maxIncluded = match[0].includes(']');

  let type: string;
  let onlyMin: number | undefined;
  let onlyMax: number | undefined;
  let min: number | undefined;
  let max: number | undefined;

  if (match.groups.staticType && isFormatType(match.groups.staticType)) {
    return new ParsedFormat({
      type: match.groups.staticType,
      hasModifier: false,
    });
  } else if (match.groups.intType) {
    type = match.groups.intType;
    onlyMin = match.groups.intOnlyMin ? parseInt(match.groups.intOnlyMin, 10) : undefined;
    onlyMax = match.groups.intOnlyMax ? parseInt(match.groups.intOnlyMax, 10) : undefined;
    min = match.groups.intMin ? parseInt(match.groups.intMin, 10) : undefined;
    max = match.groups.intMax ? parseInt(match.groups.intMax, 10) : undefined;
  } else if (match.groups.floatType) {
    type = match.groups.floatType;
    onlyMin = match.groups.floatOnlyMin ? parseFloat(match.groups.floatOnlyMin) : undefined;
    onlyMax = match.groups.floatOnlyMax ? parseFloat(match.groups.floatOnlyMax) : undefined;
    min = match.groups.floatMin ? parseFloat(match.groups.floatMin) : undefined;
    max = match.groups.floatMax ? parseFloat(match.groups.floatMax) : undefined;
  } else {
    throw new Error('Unexpected parse state');
  }

  if (onlyMax !== undefined && isFormatType(type)) {
    return new ParsedFormat({
      type,
      hasModifier: true,
      minIncluded,
      maxIncluded,
      max: onlyMax,
    });
  }

  if (onlyMin !== undefined && isFormatType(type)) {
    return new ParsedFormat({
      type,
      hasModifier: true,
      minIncluded,
      maxIncluded,
      min: onlyMin,
    });
  }

  if (min !== undefined && max !== undefined && isFormatType(type)) {
    if (min > max) {
      throw new Error('Invalid range: min is greater than max');
    }

    return new ParsedFormat({
      type,
      hasModifier: true,
      minIncluded,
      maxIncluded,
      min,
      max,
    });
  }

  throw new Error('Unexpected parse state');
}
