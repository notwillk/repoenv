import { temporaryDirectory } from 'tempy';
import { execa } from 'execa';
import { describe, it, expect } from 'vitest';
import { CLI_PATH } from './constants';
import { join } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import { stringify } from 'yaml';
import { Config } from '@/schemas/config';

describe('CLI#keyinit command', () => {
  it('initializes a key when no keys section exists', async () => {
    const dir = temporaryDirectory();
    const configFile = join(dir, 'config.yaml');
    const configVar: Omit<Config, 'keys'> = {
      vars: {},
      sources: {},
    };

    writeFileSync(configFile, stringify(configVar), 'utf8');

    const { stdout, exitCode } = await execa(
      'node',
      [
        CLI_PATH,
        '--config',
        configFile,
        '-vvv',
        'keyinit',
        'NEW_KEY',
        '--algorithm',
        'aes-256-gcm',
      ],
      {
        reject: false,
      },
    );

    expect(exitCode).toBe(0);
    expect(stdout).toBe('');

    const newFile = readFileSync(configFile, 'utf8');

    expect(newFile).toContain(
      'keys: { NEW_KEY: { scheme: aes-256-gcm, update: { cmd: "cat # update this" } } }',
    );
  });

  it('initializes a key when keys section exists but this is new', async () => {
    const dir = temporaryDirectory();
    const configFile = join(dir, 'config.yaml');
    const configVar: Config = {
      vars: {},
      sources: {},
      keys: { EXISTING_KEY: { scheme: 'aes-256-gcm', update: { cmd: 'cat # update this' } } },
    };

    writeFileSync(configFile, stringify(configVar), 'utf8');

    const { stdout, exitCode } = await execa(
      'node',
      [
        CLI_PATH,
        '--config',
        configFile,
        '-vvv',
        'keyinit',
        'NEW_KEY',
        '--algorithm',
        'aes-256-gcm',
      ],
      {
        reject: false,
      },
    );

    expect(exitCode).toBe(0);
    expect(stdout).toBe('');

    const newFile = readFileSync(configFile, 'utf8');

    expect(newFile).toContain(
      [
        '  NEW_KEY:',
        '    scheme: aes-256-gcm',
        '    update:',
        '      cmd: "cat # update this"',
      ].join('\n'),
    );
  });

  it('throws error when keys exists', async () => {
    const dir = temporaryDirectory();
    const configFile = join(dir, 'config.yaml');
    const configVar: Config = {
      vars: {},
      sources: {},
      keys: { EXISTING_KEY: { scheme: 'aes-256-gcm', update: { cmd: 'cat # update this' } } },
    };

    writeFileSync(configFile, stringify(configVar), 'utf8');

    const { stderr, stdout, exitCode } = await execa(
      'node',
      [
        CLI_PATH,
        '--config',
        configFile,
        '-vvv',
        'keyinit',
        'EXISTING_KEY',
        '--algorithm',
        'aes-256-gcm',
      ],
      {
        reject: false,
      },
    );

    expect(exitCode).toBe(1);
    expect(stdout).toBe('');
    expect(stderr).toContain('Existing secret key name: EXISTING_KEY');
  });

  it('respects the algorithm when initializing a key', async () => {
    const dir = temporaryDirectory();
    const configFile = join(dir, 'config.yaml');
    const configVar: Config = {
      vars: {},
      sources: {},
      keys: { EXISTING_KEY: { scheme: 'aes-256-gcm', update: { cmd: 'cat # update this' } } },
    };

    writeFileSync(configFile, stringify(configVar), 'utf8');

    const { stdout, exitCode } = await execa(
      'node',
      [CLI_PATH, '--config', configFile, '-vvv', 'keyinit', 'NEW_KEY', '--algorithm', 'ed25519'],
      {
        reject: false,
      },
    );

    expect(exitCode).toBe(0);
    expect(stdout).toBe('');

    const newFile = readFileSync(configFile, 'utf8');

    expect(newFile).toContain(
      [
        '  NEW_KEY:',
        '    scheme: ed25519',
        '    update:',
        '      sign:',
        '        cmd: "cat # update this"',
        '      verify:',
        '        cmd: "cat # update this"',
      ].join('\n'),
    );
  });
});
