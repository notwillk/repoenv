import { describe, it, expect } from 'vitest';
import Value from './Value';

describe('Value', () => {
  it('should return the value when not redacted', () => {
    const val = new Value({ value: 'secret', redact: false });
    expect(val.toString()).toBe('secret');
  });

  it('should return REDACTED_VALUE when redacted', () => {
    const val = new Value({ value: 'secret', redact: true });
    expect(val.toString()).toBe('*****');
  });

  it('should return empty string if value is undefined and not redacted', () => {
    const val = new Value({ redact: false });
    expect(val.toString()).toBe('');
  });

  it('should return REDACTED_VALUE if value is undefined and redacted', () => {
    const val = new Value({ redact: true });
    expect(val.toString()).toBe('*****');
  });

  it('should get the value using getValue()', () => {
    const val = new Value({ value: 'abc' });
    expect(val.getValue()).toBe('abc');
  });

  it('should get undefined using getValue() if value is not set', () => {
    const val = new Value({});
    expect(val.getValue()).toBeUndefined();
  });

  it('should create Value from string using fromString()', () => {
    const val = Value.fromString('hello');
    expect(val.getValue()).toBe('hello');
    expect(val.toString()).toBe('hello');
  });

  it('should handle redact undefined as not redacted', () => {
    const val = new Value({ value: 'visible' });
    expect(val.toString()).toBe('visible');
  });

  it('should return the actual value when ignoreRedaction is true, even if redacted', () => {
    const val = new Value({ value: 'topsecret', redact: true });
    expect(val.toString({ ignoreRedaction: true })).toBe('topsecret');
  });

  it('should return empty string when ignoreRedaction is true and value is undefined', () => {
    const val = new Value({ redact: true });
    expect(val.toString({ ignoreRedaction: true })).toBe('');
  });

  it('should return the actual value when ignoreRedaction is true and redact is false', () => {
    const val = new Value({ value: 'public', redact: false });
    expect(val.toString({ ignoreRedaction: true })).toBe('public');
  });

  it('should return empty string when ignoreRedaction is true and redact is false and value is undefined', () => {
    const val = new Value({ redact: false });
    expect(val.toString({ ignoreRedaction: true })).toBe('');
  });
});
