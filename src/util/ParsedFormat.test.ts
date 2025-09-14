import { describe, it, expect } from 'vitest';
import ParsedFormat from './ParsedFormat';

describe('ParsedFormat', () => {
  it('should validate static format: url', () => {
    const pf = new ParsedFormat({ type: 'url', hasModifier: false });
    expect(pf.validate('http://example.com')).toBe(true);
    expect(pf.validate('ftp://example.com')).toBe(true);
    expect(pf.validate('example.com')).toBe(false);
  });

  it('should validate static format: email', () => {
    const pf = new ParsedFormat({ type: 'email', hasModifier: false });
    expect(pf.validate('user@example.com')).toBe(true);
    expect(pf.validate('userexample.com')).toBe(false);
  });

  it('should validate static format: uuid', () => {
    const pf = new ParsedFormat({ type: 'uuid', hasModifier: false });
    expect(pf.validate('7b59b690-9a61-4e4f-88f1-27c7f86a07df')).toBe(true);
    expect(pf.validate('short-uuid')).toBe(false);
  });

  it('should validate integer format with min/max included', () => {
    const pf = new ParsedFormat({
      type: 'integer',
      hasModifier: true,
      minIncluded: true,
      maxIncluded: true,
      min: 5,
      max: 10,
    });
    expect(pf.validate('5')).toBe(true);
    expect(pf.validate('10')).toBe(true);
    expect(pf.validate('4')).toBe(false);
    expect(pf.validate('11')).toBe(false);
    expect(pf.validate('notanumber')).toBe(false);
  });

  it('should validate integer format with min/max excluded', () => {
    const pf = new ParsedFormat({
      type: 'integer',
      hasModifier: true,
      minIncluded: false,
      maxIncluded: false,
      min: 5,
      max: 10,
    });
    expect(pf.validate('5')).toBe(false);
    expect(pf.validate('10')).toBe(false);
    expect(pf.validate('6')).toBe(true);
    expect(pf.validate('9')).toBe(true);
  });

  it('should validate float format with only min', () => {
    const pf = new ParsedFormat({
      type: 'float',
      hasModifier: true,
      minIncluded: true,
      maxIncluded: false,
      min: 1.5,
      max: undefined,
    });
    expect(pf.validate('1.5')).toBe(true);
    expect(pf.validate('1.4')).toBe(false);
    expect(pf.validate('2.0')).toBe(true);
  });

  it('should validate float format with only max', () => {
    const pf = new ParsedFormat({
      type: 'float',
      hasModifier: true,
      minIncluded: false,
      maxIncluded: true,
      min: undefined,
      max: 3.5,
    });
    expect(pf.validate('3.5')).toBe(true);
    expect(pf.validate('3.6')).toBe(false);
    expect(pf.validate('3.4')).toBe(true);
  });

  it('should return false for tooLow and tooHigh when not modified', () => {
    const pf = new ParsedFormat({ type: 'url', hasModifier: false });
    expect(pf.tooLow(1)).toBe(false);
    expect(pf.tooHigh(1)).toBe(false);
  });
  it('should always validate static formats for any string', () => {
    const pf = new ParsedFormat({ type: 'string', hasModifier: false });
    expect(pf.validate('anything')).toBe(true);
    expect(pf.validate('')).toBe(true);
    expect(pf.validate('123')).toBe(true);
  });

  it('should respect min when inclusive for integer', () => {
    const pf = new ParsedFormat({
      type: 'integer',
      hasModifier: true,
      minIncluded: true,
      maxIncluded: true,
      min: 5,
    });
    expect(pf.validate('5')).toBe(true);
    expect(pf.validate('6')).toBe(true);
    expect(pf.validate('4')).toBe(false);
  });

  it('should respect min when exclusive for integer', () => {
    const pf = new ParsedFormat({
      type: 'integer',
      hasModifier: true,
      minIncluded: false,
      maxIncluded: true,
      min: 5,
    });
    expect(pf.validate('6')).toBe(true);
    expect(pf.validate('5')).toBe(false);
    expect(pf.validate('4')).toBe(false);
  });

  it('should respect max when inclusive for float', () => {
    const pf = new ParsedFormat({
      type: 'float',
      hasModifier: true,
      minIncluded: true,
      maxIncluded: true,
      max: 5.5,
    });
    expect(pf.validate('5.5')).toBe(true);
    expect(pf.validate('5.6')).toBe(false);
    expect(pf.validate('5.4')).toBe(true);
  });

  it('should respect max when exclusive for float', () => {
    const pf = new ParsedFormat({
      type: 'float',
      hasModifier: true,
      minIncluded: true,
      maxIncluded: false,
      max: 5.5,
    });
    expect(pf.validate('5.4')).toBe(true);
    expect(pf.validate('5.5')).toBe(false);
    expect(pf.validate('5.6')).toBe(false);
  });

  it('should respect min and max when inclusive for integer', () => {
    const pf = new ParsedFormat({
      type: 'integer',
      hasModifier: true,
      minIncluded: true,
      maxIncluded: true,
      min: 1,
      max: 5,
    });
    expect(pf.validate('1')).toBe(true);
    expect(pf.validate('5')).toBe(true);
    expect(pf.validate('3')).toBe(true);
    expect(pf.validate('0')).toBe(false);
    expect(pf.validate('6')).toBe(false);
  });

  it('should respect min and max when exclusive for integer', () => {
    const pf = new ParsedFormat({
      type: 'integer',
      hasModifier: true,
      minIncluded: false,
      maxIncluded: false,
      min: 1,
      max: 5,
    });
    expect(pf.validate('2')).toBe(true);
    expect(pf.validate('1')).toBe(false);
    expect(pf.validate('5')).toBe(false);
    expect(pf.validate('0')).toBe(false);
    expect(pf.validate('6')).toBe(false);
  });
  it('should handle null values in tooLow and tooHigh', () => {
    const pf = new ParsedFormat({
      type: 'integer',
      hasModifier: true,
      minIncluded: true,
      maxIncluded: true,
      min: 0,
      max: 10,
    });
    expect(pf.tooLow(null)).toBe(false);
    expect(pf.tooHigh(null)).toBe(false);
  });

  it('should validate string format', () => {
    const pf = new ParsedFormat({ type: 'string', hasModifier: false });
    expect(pf.validate('hello')).toBe(true);
    expect(pf.validate('')).toBe(true);
  });

  it('should validate base64 format', () => {
    const pf = new ParsedFormat({ type: 'base64', hasModifier: false });
    expect(pf.validate('SGVsbG8=')).toBe(true);
    expect(pf.validate('notbase64')).toBe(false);
  });

  it('should validate hex format', () => {
    const pf = new ParsedFormat({ type: 'hex', hasModifier: false });
    expect(pf.validate('deadbeef')).toBe(true);
    expect(pf.validate('xyz')).toBe(false);
  });

  it('should validate ulid format', () => {
    const pf = new ParsedFormat({ type: 'ulid', hasModifier: false });
    expect(pf.validate('01ARZ3NDEKTSV4RRFFQ69G5FAV')).toBe(true);
    expect(pf.validate('short')).toBe(false);
  });

  it('should validate ipv4 format', () => {
    const pf = new ParsedFormat({ type: 'ipv4', hasModifier: false });
    expect(pf.validate('127.0.0.1')).toBe(true);
    expect(pf.validate('::1')).toBe(false);
  });

  it('should validate ipv6 format', () => {
    const pf = new ParsedFormat({ type: 'ipv6', hasModifier: false });
    expect(pf.validate('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true);
    expect(pf.validate('127.0.0.1')).toBe(false);
  });
});
