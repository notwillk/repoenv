import { describe, it, expect } from 'vitest';
import makeAbsolutePath from './makeAbsolutePath';
import path from 'node:path';

describe('makeAbsolutePath', () => {
  it('returns the same path if already absolute', () => {
    const absolute = path.resolve('/foo/bar');
    expect(makeAbsolutePath(absolute)).toBe(absolute);
  });

  it('resolves relative path from process.cwd() if baseDirectory is not provided', () => {
    const relative = 'foo/bar';
    const expected = path.resolve(process.cwd(), relative);
    expect(makeAbsolutePath(relative)).toBe(expected);
  });

  it('resolves relative path from provided baseDirectory', () => {
    const relative = 'baz/qux';
    const base = '/tmp/test';
    const expected = path.resolve(base, relative);
    expect(makeAbsolutePath(relative, base)).toBe(expected);
  });

  it('handles empty string as relative path', () => {
    const expected = path.resolve(process.cwd(), '');
    expect(makeAbsolutePath('')).toBe(expected);
  });

  it('handles "." as relative path', () => {
    const expected = path.resolve(process.cwd(), '.');
    expect(makeAbsolutePath('.')).toBe(expected);
  });

  it('handles ".." as relative path', () => {
    const expected = path.resolve(process.cwd(), '..');
    expect(makeAbsolutePath('..')).toBe(expected);
  });

  it('handles baseDirectory with trailing slash', () => {
    const relative = 'file.txt';
    const base = '/tmp/test/';
    const expected = path.resolve(base, relative);
    expect(makeAbsolutePath(relative, base)).toBe(expected);
  });
});
