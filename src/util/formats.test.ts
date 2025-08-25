import { describe, it, expect, beforeEach } from 'vitest';

import { getFormatRegex } from './formats';

const TEST_STATIC_FORMATS = ['url', 'iso8601', 'email', 'ipv4', 'ipv6'];
const TEST_INTEGER_MODIFIED_FORMATS = ['string', 'base64', 'hex'];
const TEST_FLOAT_MODIFIED_FORMATS = ['float'];

describe('#formats', () => {
  let re: RegExp;
  describe('getFormatRegex', () => {
    beforeEach(() => {
      re = getFormatRegex({
        staticFormats: TEST_STATIC_FORMATS,
        integerModifiedFormats: TEST_INTEGER_MODIFIED_FORMATS,
        floatModifiedFormats: TEST_FLOAT_MODIFIED_FORMATS,
      });
    });

    it('should match all formats without modifiers', () => {
      for (const format of [
        ...TEST_STATIC_FORMATS,
        ...TEST_INTEGER_MODIFIED_FORMATS,
        ...TEST_FLOAT_MODIFIED_FORMATS,
      ]) {
        expect(re.test(format)).toBe(true);
      }
    });

    it('should not match bad formats', () => {
      expect(re.test('unknownformat')).toBe(false);
    });

    it('should match integer modified formats with modifiers', () => {
      expect(re.test('string[1,5]')).toBe(true);
      expect(re.test('base64(2,10)')).toBe(true);
      expect(re.test('hex[,8]')).toBe(true);
      expect(re.test('string[3]')).toBe(true);
      expect(re.test('base64(2,10]')).toBe(true);
      expect(re.test('hex[2,10)')).toBe(true);
    });

    it('should match float modified formats with modifiers', () => {
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
});
