import { temporaryDirectory } from 'tempy';
import { execa } from 'execa';
import { describe, it, expect } from 'vitest';
import { CLI_PATH } from './constants';
import { join } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';

describe('CLI#init command', () => {
  it('initializes config file when one is given', async () => {
    const dir = temporaryDirectory();
    const configFile = join(dir, 'new_config.yaml');

    const { stderr, stdout, exitCode } = await execa(
      'node',
      [CLI_PATH, '-vvv', 'init', configFile],
      {
        reject: false,
      },
    );

    expect(exitCode).toBe(0);
    expect(stdout).toBe('');
    expect(stderr).toContain(`Config created at ${configFile}`);

    const newFile = readFileSync(configFile, 'utf8');

    expect(newFile).toContain(['vars: {}', 'sources: {}', 'keys: {}'].join('\n'));
  });

  it('errors when initializing when config file exists', async () => {
    const dir = temporaryDirectory();
    const configFile = join(dir, 'new_config.yaml');
    writeFileSync(configFile, 'boop', 'utf8');

    const { stderr, stdout, exitCode } = await execa(
      'node',
      [CLI_PATH, '-vvv', 'init', configFile],
      {
        reject: false,
      },
    );

    expect(exitCode).toBe(1);
    expect(stdout).toBe('');
    expect(stderr).toContain(`Config file exists: ${configFile}`);
  });
});
