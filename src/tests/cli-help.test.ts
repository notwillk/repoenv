import { execa } from 'execa';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

const CLI_PATH = resolve(__dirname, '..', '..', 'dist', 'index.cjs');

describe('CLI#help command', () => {
  it('shows help screen', async () => {
    const { stdout } = await execa`node ${CLI_PATH} help`;
    expect(stdout.trim()).toContain('Usage: repoenv [options] [command]');
  });
});
