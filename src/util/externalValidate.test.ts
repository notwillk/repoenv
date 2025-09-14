import { describe, it, expect, vi, Mock } from 'vitest';
import externalValidate from './externalValidate';
import { execa } from 'execa';

vi.mock('execa');

describe('externalValidate', () => {
  it('returns true if command is not provided', async () => {
    const result = await externalValidate({ value: 'test', command: undefined });
    expect(result).toBe(true);
  });

  it('returns false if value is undefined and validation passes', async () => {
    (execa as unknown as Mock).mockResolvedValueOnce({ exitCode: 0 });
    const result = await externalValidate({ value: undefined, command: 'echo' });
    expect(result).toBe(true);
  });

  it('returns true if execa returns exitCode 0', async () => {
    (execa as unknown as Mock).mockResolvedValueOnce({ exitCode: 0 });
    const result = await externalValidate({ value: 'test', command: 'echo' });
    expect(result).toBe(true);
  });

  it('returns false if execa returns non-zero exitCode', async () => {
    (execa as unknown as Mock).mockResolvedValueOnce({ exitCode: 1 });
    const result = await externalValidate({ value: 'test', command: 'echo' });
    expect(result).toBe(false);
  });

  it('returns false if execa throws an error', async () => {
    (execa as unknown as Mock).mockRejectedValueOnce(new Error('fail'));
    const result = await externalValidate({ value: 'test', command: 'echo' });
    expect(result).toBe(false);
  });
});
