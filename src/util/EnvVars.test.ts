import { describe, it, expect, beforeEach } from 'vitest';
import EnvVars from './EnvVars';

describe('EnvVars', () => {
  let env: EnvVars;

  beforeEach(() => {
    env = new EnvVars({ FOO: 'bar', BAZ: 'qux' });
  });

  it('should get a value by key', () => {
    expect(env.get('FOO')).toBe('bar');
    expect(env.get('BAZ')).toBe('qux');
    expect(env.get('NOT_SET')).toBeUndefined();
  });

  it('should set a value', () => {
    env.set('NEW', 'value');
    expect(env.get('NEW')).toBe('value');
  });

  it('should keep a key when value is undefined', () => {
    env.set('FOO', undefined);
    expect(env.get('FOO')).toBeUndefined();
    expect(env.keys()).toContain('FOO');
  });

  it('should return all keys', () => {
    expect(env.keys().sort()).toEqual(['BAZ', 'FOO'].sort());
    env.set('NEW', 'value');
    expect(env.keys()).toContain('NEW');
  });

  it('should return all entries', () => {
    expect(env.entries()).toContainEqual(['FOO', 'bar']);
    expect(env.entries()).toContainEqual(['BAZ', 'qux']);
  });

  it('should serialize to JSON', () => {
    expect(env.toObject()).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  it('should serialize to dotenv format', () => {
    env.set('QUOTED', 'value"with"quotes');
    const dotenv = env.toDotenv();
    expect(dotenv).toContain('FOO="bar"');
    expect(dotenv).toContain('BAZ="qux"');
    expect(dotenv).toContain('QUOTED="value\\"with\\"quotes"');
  });

  it('should handle undefined values in toDotenv', () => {
    env.set('FOO', undefined);
    expect(env.toDotenv()).toContain('FOO=');
  });

  it('should create from process.env', () => {
    const envVars = new EnvVars(process.env);
    expect(envVars).toBeInstanceOf(EnvVars);
    expect(typeof envVars.get('PATH')).toBe('string');
  });

  it('should create from another EnvVar without modifying', () => {
    const copy = new EnvVars(env);
    expect(copy.toObject()).toEqual(env.toObject());
    copy.set('FOO', 'changed');
    expect(env.get('FOO')).toBe('bar');
    expect(copy.get('FOO')).toBe('changed');
  });
});
