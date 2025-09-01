import { execa } from 'execa';
import { describe, it, expect } from 'vitest';
import { BAD_COMMAND, CLI_PATH } from './constants';

describe('CLI#unknown command', () => {
  it('has a helpful message for unknown commands', async () => {
    const { stderr, exitCode } = await execa('node', [CLI_PATH, BAD_COMMAND], {
      reject: false,
    });
    expect(exitCode).not.toBe(0);
    expect(stderr.trim()).toContain("error: unknown command '" + BAD_COMMAND + "'");
  });

  it('shows help screen without command', async () => {
    const { stderr, exitCode } = await execa('node', [CLI_PATH], {
      reject: false,
    });
    expect(exitCode).not.toBe(0);
    expect(stderr.trim()).toContain('Usage: repoenv [options] [command]');
  });
});
