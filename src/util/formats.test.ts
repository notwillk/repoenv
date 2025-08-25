import { describe, it, expect } from 'vitest';

import {
  getFormatRegex,
  parseFormat,
  INTEGER_PATTERN,
  FLOAT_PATTERN,
  INTEGER_ONLY_MIN_PATTERN,
  INTEGER_ONLY_MAX_PATTERN,
  INTEGER_RANGE_PATTERN,
  INTEGER_MODIFIER_PATTERN,
  FLOAT_ONLY_MIN_PATTERN,
  FLOAT_ONLY_MAX_PATTERN,
  FLOAT_RANGE_PATTERN,
  FLOAT_MODIFIER_PATTERN,
  getStaticPattern,
  getFloatModifiedPattern,
  getIntegerModifiedPattern,
  getRangePattern,
  getFormatValidator,
} from './formats';
import { exit } from 'process';
import { match } from 'assert';

const TEST_STATIC_FORMATS = ['url', 'iso8601', 'email', 'ipv4', 'ipv6'];
const TEST_INTEGER_MODIFIED_FORMATS = ['string', 'base64', 'hex'];
const TEST_FLOAT_MODIFIED_FORMATS = ['float'];
const ALL_FORMATS = [
  ...TEST_STATIC_FORMATS,
  ...TEST_INTEGER_MODIFIED_FORMATS,
  ...TEST_FLOAT_MODIFIED_FORMATS,
];
const MODIFIED_FORMATS = [...TEST_INTEGER_MODIFIED_FORMATS, ...TEST_FLOAT_MODIFIED_FORMATS];

const TEST_FORMATS = {
  staticFormats: TEST_STATIC_FORMATS,
  integerModifiedFormats: TEST_INTEGER_MODIFIED_FORMATS,
  floatModifiedFormats: TEST_FLOAT_MODIFIED_FORMATS,
};

describe('#formats', () => {
  describe('regex patterns', () => {
    it('INTEGER_PATTERN should match integers', () => {
      const re = new RegExp(`^${INTEGER_PATTERN}$`);
      expect(re.test('123')).toBe(true);
      expect(re.test('-123')).toBe(true);
      expect(re.test('+123')).toBe(true);
      expect(re.test('0')).toBe(true);
      expect(re.test('0123')).toBe(true);
      expect(re.test('123.4')).toBe(false);
      expect(re.test('abc')).toBe(false);
    });

    it('FLOAT_PATTERN should match floats', () => {
      const re = new RegExp(`^${FLOAT_PATTERN}$`);
      expect(re.test('123')).toBe(true);
      expect(re.test('-123')).toBe(true);
      expect(re.test('+123')).toBe(true);
      expect(re.test('0')).toBe(true);
      expect(re.test('0123')).toBe(true);
      expect(re.test('123.4')).toBe(true);
      expect(re.test('123.')).toBe(true);
      expect(re.test('-123.')).toBe(true);
      expect(re.test('+123.')).toBe(true);
      expect(re.test('0.0')).toBe(true);
      expect(re.test('-0.0')).toBe(true);
      expect(re.test('+0.0')).toBe(true);
      expect(re.test('.4')).toBe(false);
      expect(re.test('abc')).toBe(false);
    });

    it('INTEGER_ONLY_MIN_PATTERN should match only a minimum', () => {
      const testString = '1';
      const re_min = new RegExp(`^${INTEGER_ONLY_MIN_PATTERN}$`);
      const re_max = new RegExp(`^${INTEGER_ONLY_MAX_PATTERN}$`);
      const re_range = new RegExp(`^${INTEGER_RANGE_PATTERN}$`);

      expect(re_min.test(testString)).toBe(true);
      expect(re_max.test(testString)).toBe(false);
      expect(re_range.test(testString)).toBe(false);
    });

    it('INTEGER_ONLY_MAX_PATTERN should match only a maximum', () => {
      const testString = ',1';
      const re_min = new RegExp(`^${INTEGER_ONLY_MIN_PATTERN}$`);
      const re_max = new RegExp(`^${INTEGER_ONLY_MAX_PATTERN}$`);
      const re_range = new RegExp(`^${INTEGER_RANGE_PATTERN}$`);

      expect(re_min.test(testString)).toBe(false);
      expect(re_max.test(testString)).toBe(true);
      expect(re_range.test(testString)).toBe(false);
    });

    it('INTEGER_RANGE_PATTERN should match a range', () => {
      const testString = '1,5';
      const re_min = new RegExp(`^${INTEGER_ONLY_MIN_PATTERN}$`);
      const re_max = new RegExp(`^${INTEGER_ONLY_MAX_PATTERN}$`);
      const re_range = new RegExp(`^${INTEGER_RANGE_PATTERN}$`);

      expect(re_min.test(testString)).toBe(false);
      expect(re_max.test(testString)).toBe(false);
      expect(re_range.test(testString)).toBe(true);
    });

    it('INTEGER_MODIFIER_PATTERN should match integer modifiers', () => {
      const re = new RegExp(`^${INTEGER_MODIFIER_PATTERN}$`);
      expect(re.test('1')).toBe(true);
      expect(re.test(',5')).toBe(true);
      expect(re.test('1,5')).toBe(true);
    });

    it('FLOAT_ONLY_MIN_PATTERN should match only a minimum', () => {
      const testString = '1.5';
      const re_min = new RegExp(`^${FLOAT_ONLY_MIN_PATTERN}$`);
      const re_max = new RegExp(`^${FLOAT_ONLY_MAX_PATTERN}$`);
      const re_range = new RegExp(`^${FLOAT_RANGE_PATTERN}$`);

      expect(re_min.test(testString)).toBe(true);
      expect(re_max.test(testString)).toBe(false);
      expect(re_range.test(testString)).toBe(false);
    });

    it('FLOAT_ONLY_MAX_PATTERN should match only a maximum', () => {
      const testString = ',1.5';
      const re_min = new RegExp(`^${FLOAT_ONLY_MIN_PATTERN}$`);
      const re_max = new RegExp(`^${FLOAT_ONLY_MAX_PATTERN}$`);
      const re_range = new RegExp(`^${FLOAT_RANGE_PATTERN}$`);

      expect(re_min.test(testString)).toBe(false);
      expect(re_max.test(testString)).toBe(true);
      expect(re_range.test(testString)).toBe(false);
    });

    it('FLOAT_RANGE_PATTERN should match a range', () => {
      const testString = '1.5,5.3';
      const re_min = new RegExp(`^${FLOAT_ONLY_MIN_PATTERN}$`);
      const re_max = new RegExp(`^${FLOAT_ONLY_MAX_PATTERN}$`);
      const re_range = new RegExp(`^${FLOAT_RANGE_PATTERN}$`);

      expect(re_min.test(testString)).toBe(false);
      expect(re_max.test(testString)).toBe(false);
      expect(re_range.test(testString)).toBe(true);
    });

    it('FLOAT_MODIFIER_PATTERN should match float modifiers', () => {
      const re = new RegExp(`^${FLOAT_MODIFIER_PATTERN}$`);
      expect(re.test('1.5')).toBe(true);
      expect(re.test(',5.3')).toBe(true);
      expect(re.test('1.5,5.3')).toBe(true);
    });

    it('getRangePattern should match when wrapped with [], (), [), or (]', () => {
      const re = new RegExp(`^${getRangePattern('abc')}$`);
      expect(re.test('[abc]')).toBe(true);
      expect(re.test('(abc)')).toBe(true);
      expect(re.test('[abc)')).toBe(true);
      expect(re.test('(abc]')).toBe(true);
      expect(re.test('abc')).toBe(false);
    });

    for (const format of ALL_FORMATS) {
      it(`getStaticPattern should match static format: ${format}`, () => {
        const pattern = getStaticPattern(ALL_FORMATS);
        const re = new RegExp(`^${pattern}$`);
        expect(re.test(format)).toBe(true);
      });
    }

    for (const format of MODIFIED_FORMATS) {
      it(`getIntegerModifiedPattern should match integer modified format: ${format}`, () => {
        const pattern = getIntegerModifiedPattern(MODIFIED_FORMATS);
        const re = new RegExp(`^${pattern}$`);
        expect(re.test(`${format}[1,2]`)).toBe(true);
      });
    }

    for (const format of TEST_FLOAT_MODIFIED_FORMATS) {
      it(`getFloatModifiedPattern should match float modified format: ${format}`, () => {
        const pattern = getFloatModifiedPattern(TEST_FLOAT_MODIFIED_FORMATS);
        const re = new RegExp(`^${pattern}$`);
        expect(re.test(`${format}[1.2,3.4]`)).toBe(true);
      });
    }
  });

  describe('getFormatRegex', () => {
    it('should match "string" format without modifiers', () => {
      const re = getFormatRegex(TEST_FORMATS);
      expect(re.test('string')).toBe(true);
    });

    for (const format of ALL_FORMATS) {
      it(`should match all formats without modifiers: ${format}`, () => {
        const re = getFormatRegex(TEST_FORMATS);
        expect(re.test(format)).toBe(true);
      });
    }

    it('should not match bad formats', () => {
      const re = getFormatRegex(TEST_FORMATS);
      expect(re.test('unknownformat')).toBe(false);
    });

    it('should match integer modified formats with modifiers', () => {
      const re = getFormatRegex(TEST_FORMATS);
      expect(re.test('string[1,5]')).toBe(true);
      expect(re.test('base64(2,10)')).toBe(true);
      expect(re.test('hex[,8]')).toBe(true);
      expect(re.test('string[3]')).toBe(true);
      expect(re.test('base64(2,10]')).toBe(true);
      expect(re.test('hex[2,10)')).toBe(true);
    });

    it('should match float modified formats with modifiers', () => {
      const re = getFormatRegex(TEST_FORMATS);
      expect(re.test('float[1,5]')).toBe(true);
      expect(re.test('float(2,10)')).toBe(true);
      expect(re.test('float[,8]')).toBe(true);
      expect(re.test('float[3]')).toBe(true);
      expect(re.test('float(2,10]')).toBe(true);
      expect(re.test('float[2,10)')).toBe(true);

      expect(re.test('float[1.0,5.1]')).toBe(true);
      expect(re.test('float(2.,10.1)')).toBe(true);
      expect(re.test('float[,8.1]')).toBe(true);
      expect(re.test('float[3.]')).toBe(true);
      expect(re.test('float(2.,10.1]')).toBe(true);
      expect(re.test('float[2.,10.1)')).toBe(true);
    });
  });

  describe('parseFormat', () => {
    it('should return null when it does not parse', () => {
      expect(null).toEqual(parseFormat('bad_format', TEST_FORMATS));
    });

    it('should parse "string" format without modifiers', () => {
      expect(parseFormat('string', TEST_FORMATS)).toEqual({
        type: 'string',
        hasModifier: false,
      });
    });

    for (const format of ALL_FORMATS) {
      it(`should parse all formats without modifiers: ${format}`, () => {
        const parsed = parseFormat(format, TEST_FORMATS);
        expect(parsed).toEqual({
          type: format,
          hasModifier: false,
        });
      });
    }

    it('should parse integer modified formats with modifiers, with min & max', () => {
      expect(parseFormat('string[1,5]', TEST_FORMATS)).toEqual({
        type: 'string',
        hasModifier: true,
        minIncluded: true,
        maxIncluded: true,
        min: 1,
        max: 5,
      });

      expect(parseFormat('string(1,5)', TEST_FORMATS)).toEqual({
        type: 'string',
        hasModifier: true,
        minIncluded: false,
        maxIncluded: false,
        min: 1,
        max: 5,
      });

      expect(parseFormat('string[1,5)', TEST_FORMATS)).toEqual({
        type: 'string',
        hasModifier: true,
        minIncluded: true,
        maxIncluded: false,
        min: 1,
        max: 5,
      });

      expect(parseFormat('string(1,5]', TEST_FORMATS)).toEqual({
        type: 'string',
        hasModifier: true,
        minIncluded: false,
        maxIncluded: true,
        min: 1,
        max: 5,
      });
    });

    it('should parse integer modified formats with modifiers, with only min', () => {
      expect(parseFormat('string(1)', TEST_FORMATS)).toEqual({
        type: 'string',
        hasModifier: true,
        minIncluded: false,
        maxIncluded: false,
        min: 1,
      });

      expect(parseFormat('string[1]', TEST_FORMATS)).toEqual({
        type: 'string',
        hasModifier: true,
        minIncluded: true,
        maxIncluded: true,
        min: 1,
      });

      expect(parseFormat('string[1)', TEST_FORMATS)).toEqual({
        type: 'string',
        hasModifier: true,
        minIncluded: true,
        maxIncluded: false,
        min: 1,
      });

      expect(parseFormat('string(1]', TEST_FORMATS)).toEqual({
        type: 'string',
        hasModifier: true,
        minIncluded: false,
        maxIncluded: true,
        min: 1,
      });
    });

    it('should parse integer modified formats with modifiers, with only max', () => {
      expect(parseFormat('string(,1)', TEST_FORMATS)).toEqual({
        type: 'string',
        hasModifier: true,
        minIncluded: false,
        maxIncluded: false,
        max: 1,
      });

      expect(parseFormat('string[,1]', TEST_FORMATS)).toEqual({
        type: 'string',
        hasModifier: true,
        minIncluded: true,
        maxIncluded: true,
        max: 1,
      });

      expect(parseFormat('string(,1]', TEST_FORMATS)).toEqual({
        type: 'string',
        hasModifier: true,
        minIncluded: false,
        maxIncluded: true,
        max: 1,
      });

      expect(parseFormat('string[,1)', TEST_FORMATS)).toEqual({
        type: 'string',
        hasModifier: true,
        minIncluded: true,
        maxIncluded: false,
        max: 1,
      });
    });

    it('should parse float modified formats with modifiers, with min & max', () => {
      expect(parseFormat('float[1.5,5.3]', TEST_FORMATS)).toEqual({
        type: 'float',
        hasModifier: true,
        minIncluded: true,
        maxIncluded: true,
        min: 1.5,
        max: 5.3,
      });

      expect(parseFormat('float(1.5,5.3)', TEST_FORMATS)).toEqual({
        type: 'float',
        hasModifier: true,
        minIncluded: false,
        maxIncluded: false,
        min: 1.5,
        max: 5.3,
      });

      expect(parseFormat('float[1.5,5.3)', TEST_FORMATS)).toEqual({
        type: 'float',
        hasModifier: true,
        minIncluded: true,
        maxIncluded: false,
        min: 1.5,
        max: 5.3,
      });

      expect(parseFormat('float(1.5,5.3]', TEST_FORMATS)).toEqual({
        type: 'float',
        hasModifier: true,
        minIncluded: false,
        maxIncluded: true,
        min: 1.5,
        max: 5.3,
      });
    });

    it('should parse float modified formats with modifiers, with only min', () => {
      expect(parseFormat('float(1.4)', TEST_FORMATS)).toEqual({
        type: 'float',
        hasModifier: true,
        minIncluded: false,
        maxIncluded: false,
        min: 1.4,
      });

      expect(parseFormat('float[1.4]', TEST_FORMATS)).toEqual({
        type: 'float',
        hasModifier: true,
        minIncluded: true,
        maxIncluded: true,
        min: 1.4,
      });

      expect(parseFormat('float[1.4)', TEST_FORMATS)).toEqual({
        type: 'float',
        hasModifier: true,
        minIncluded: true,
        maxIncluded: false,
        min: 1.4,
      });

      expect(parseFormat('float(1.4]', TEST_FORMATS)).toEqual({
        type: 'float',
        hasModifier: true,
        minIncluded: false,
        maxIncluded: true,
        min: 1.4,
      });
    });

    it('should parse float modified formats with modifiers, with only max', () => {
      expect(parseFormat('float(,1.8)', TEST_FORMATS)).toEqual({
        type: 'float',
        hasModifier: true,
        minIncluded: false,
        maxIncluded: false,
        max: 1.8,
      });

      expect(parseFormat('float[,1.8]', TEST_FORMATS)).toEqual({
        type: 'float',
        hasModifier: true,
        minIncluded: true,
        maxIncluded: true,
        max: 1.8,
      });

      expect(parseFormat('float(,1.8]', TEST_FORMATS)).toEqual({
        type: 'float',
        hasModifier: true,
        minIncluded: false,
        maxIncluded: true,
        max: 1.8,
      });

      expect(parseFormat('float[,1.8)', TEST_FORMATS)).toEqual({
        type: 'float',
        hasModifier: true,
        minIncluded: true,
        maxIncluded: false,
        max: 1.8,
      });
    });
  });

  describe('getFormatValidator', () => {
    it('should always validate static formats', () => {
      const validate = getFormatValidator({ type: 'string', hasModifier: false });
      expect(validate(null)).toBe(true);
    });

    it('should respect min when inclusive', () => {
      const validate = getFormatValidator({
        type: 'string',
        hasModifier: true,
        minIncluded: true,
        maxIncluded: true,
        min: 5,
      });
      expect(validate(5)).toBe(true);
      expect(validate(4)).toBe(false);
    });

    it('should respect min when exclusive', () => {
      const validate = getFormatValidator({
        type: 'string',
        hasModifier: true,
        minIncluded: false,
        maxIncluded: true,
        min: 5,
      });
      expect(validate(5.1)).toBe(true);
      expect(validate(5)).toBe(false);
    });

    it('should respect max when inclusive', () => {
      const validate = getFormatValidator({
        type: 'string',
        hasModifier: true,
        minIncluded: true,
        maxIncluded: true,
        max: 5,
      });
      expect(validate(5)).toBe(true);
      expect(validate(5.1)).toBe(false);
    });

    it('should respect max when exclusive', () => {
      const validate = getFormatValidator({
        type: 'string',
        hasModifier: true,
        minIncluded: true,
        maxIncluded: false,
        max: 5,
      });
      expect(validate(4.9)).toBe(true);
      expect(validate(5)).toBe(false);
    });

    it('should respect min and max when inclusive', () => {
      const validate = getFormatValidator({
        type: 'string',
        hasModifier: true,
        minIncluded: true,
        maxIncluded: true,
        min: 1,
        max: 5,
      });
      expect(validate(2)).toBe(true);
      expect(validate(1)).toBe(true);
      expect(validate(5)).toBe(true);
      expect(validate(0)).toBe(false);
      expect(validate(6)).toBe(false);
    });

    it('should respect min and max when exclusive', () => {
      const validate = getFormatValidator({
        type: 'string',
        hasModifier: true,
        minIncluded: false,
        maxIncluded: false,
        min: 1,
        max: 5,
      });
      expect(validate(2)).toBe(true);
      expect(validate(1)).toBe(false);
      expect(validate(5)).toBe(false);
    });
  });
});
