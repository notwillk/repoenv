import { describe, it, expect } from 'vitest';
import validators from './validators';

describe('validators', () => {
  it('validates string', () => {
    expect(validators.string.validator('hello')).toBe(true);
    expect(validators.string.numericalValue('hello')).toBe(5);
    expect(validators.string.validator('')).toBe(true);
    expect(validators.string.numericalValue('')).toBe(0);
  });

  it('validates base64', () => {
    expect(validators.base64.validator('aGVsbG8=')).toBe(true);
    expect(validators.base64.numericalValue('aGVsbG8=')).toBe(5);
    expect(validators.base64.validator('notbase64')).toBe(false);
    expect(validators.base64.numericalValue('')).toBe(0);
  });

  it('validates hex', () => {
    expect(validators.hex.validator('deadbeef')).toBe(true);
    expect(validators.hex.numericalValue('deadbeef')).toBe(4);
    expect(validators.hex.validator('0xdeadbeef')).toBe(true);
    expect(validators.hex.numericalValue('0xdeadbeef')).toBe(4);
    expect(validators.hex.validator('nothex')).toBe(false);
    expect(validators.hex.numericalValue('')).toBe(0);
  });

  it('validates integer', () => {
    expect(validators.integer.validator('123')).toBe(true);
    expect(validators.integer.numericalValue('123')).toBe(123);
    expect(validators.integer.validator('abc')).toBe(false);
    expect(validators.integer.numericalValue('abc')).toBeNaN();
  });

  it('validates float', () => {
    expect(validators.float.validator('123.45')).toBe(true);
    expect(validators.float.numericalValue('123.45')).toBeCloseTo(123.45);
    expect(validators.float.validator('abc')).toBe(false);
    expect(validators.float.numericalValue('abc')).toBeNaN();
  });

  it('validates url', () => {
    expect(validators.url.validator('https://example.com')).toBe(true);
    expect(validators.url.validator('not a url')).toBe(false);
    expect(validators.url.numericalValue('https://example.com')).toBeNull();
  });

  it('validates email', () => {
    expect(validators.email.validator('test@example.com')).toBe(true);
    expect(validators.email.validator('notanemail')).toBe(false);
    expect(validators.email.numericalValue('test@example.com')).toBeNull();
  });

  it('validates uuid', () => {
    expect(validators.uuid.validator('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
    expect(validators.uuid.validator('notauuid')).toBe(false);
    expect(validators.uuid.numericalValue('123e4567-e89b-12d3-a456-426614174000')).toBeNull();
  });

  it('validates ipv4', () => {
    expect(validators.ipv4.validator('192.168.1.1')).toBe(true);
    expect(validators.ipv4.validator('notanip')).toBe(false);
    expect(validators.ipv4.numericalValue('192.168.1.1')).toBeNull();
  });

  it('validates ipv6', () => {
    expect(validators.ipv6.validator('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true);
    expect(validators.ipv6.validator('notanip')).toBe(false);
    expect(validators.ipv6.numericalValue('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBeNull();
  });

  it('validates ulid', () => {
    expect(validators.ulid.validator('01ARZ3NDEKTSV4RRFFQ69G5FAV')).toBe(true);
    expect(validators.ulid.validator('notaulid')).toBe(false);
    expect(validators.ulid.numericalValue('01ARZ3NDEKTSV4RRFFQ69G5FAV')).toBeNull();
  });

  it('validates iso8601', () => {
    expect(validators.iso8601.validator('2023-01-01T00:00:00Z')).toBe(true);
    expect(validators.iso8601.validator('notadate')).toBe(false);
    expect(validators.iso8601.numericalValue('2023-01-01T00:00:00Z')).toBeNull();
  });
});
