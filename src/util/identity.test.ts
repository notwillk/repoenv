import { describe, it, expect } from 'vitest';

const sum = (a: number, b: number) => a + b;
function identity<T>(value: T): T {
  return value;
}

describe('identity', () => {
  describe('sum', () => {
    it('adds two numbers', () => {
      expect(sum(2, 3)).toBe(5);
    });
  });

  describe('identity', () => {
    it('returns the same value it is given', () => {
      expect(identity(42)).toBe(42);
      expect(identity('hello')).toBe('hello');
      const obj = { a: 1 };
      expect(identity(obj)).toBe(obj);
    });
  });
});
