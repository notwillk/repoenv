import { temporaryDirectory } from 'tempy';
import { execa } from 'execa';
import { describe, it, expect } from 'vitest';
import { CLI_PATH } from './constants';
import { join } from 'node:path';
import { writeFileSync } from 'node:fs';
import { stringify } from 'yaml';
import { Source } from '@/schemas/source';
import { Config } from '@/schemas/config';
import { aes256GcmEncrypt, aes256GcmGenerateKey } from '../util/crypto';

describe('CLI#compile command', () => {
  describe('no file given', () => {
    it('outputs input env vars in dotenv format', async () => {
      const { stdout, exitCode } = await execa('node', [CLI_PATH, 'compile'], {
        reject: false,
        env: { FOO: 'bar' },
      });
      expect(exitCode).toBe(0);
      expect(stdout.trim()).toContain('FOO="bar"');
    });

    it('outputs input env vars in json format', async () => {
      let parsed;

      const { stdout, exitCode } = await execa('node', [CLI_PATH, '--json', 'compile'], {
        reject: false,
        env: { FOO: 'bar' },
      });

      expect(exitCode).toBe(0);

      expect(() => {
        parsed = JSON.parse(stdout.trim());
      }).not.toThrow();

      expect(parsed).toMatchObject({ FOO: 'bar' });
    });
  });

  it('outputs only foo with only foo filter', async () => {
    const dir = temporaryDirectory();
    const file = join(dir, 'env.yaml');
    const envVar: Source = {
      vars: {},
      filter: ['FOO'],
    };

    writeFileSync(file, stringify(envVar), 'utf8');

    const { stdout, exitCode } = await execa('node', [CLI_PATH, 'compile', file], {
      reject: false,
      env: { FOO: 'bar' },
    });
    expect(exitCode).toBe(0);
    expect(stdout.trim()).toBe('FOO="bar"');
  });

  it('outputs foo and bar', async () => {
    const dir = temporaryDirectory();
    const file = join(dir, 'env.yaml');
    const envVar: Source = {
      vars: { BAR: 'should appear' },
      filter: ['FOO', 'BAR'],
    };

    writeFileSync(file, stringify(envVar), 'utf8');

    const { stdout, exitCode } = await execa(
      'node',
      [CLI_PATH, '--json', '-vvv', 'compile', file],
      {
        reject: false,
        env: { FOO: 'bar' },
      },
    );
    expect(exitCode).toBe(0);

    let parsed;
    expect(() => {
      parsed = JSON.parse(stdout.trim());
    }).not.toThrow();

    expect(parsed).toMatchObject({ FOO: 'bar', BAR: 'should appear' });
  });

  it('outputs foo and derived bar', async () => {
    const dir = temporaryDirectory();
    const file = join(dir, 'env.yaml');
    const envVar: Source = {
      vars: { BAR: { value: '-->${FOO}<--' } },
      filter: ['FOO', 'BAR'],
    };

    writeFileSync(file, stringify(envVar), 'utf8');

    const { stdout, exitCode } = await execa(
      'node',
      [CLI_PATH, '--json', '-vvv', 'compile', file],
      {
        reject: false,
        env: { FOO: 'bar' },
      },
    );
    expect(exitCode).toBe(0);

    let parsed;
    expect(() => {
      parsed = JSON.parse(stdout.trim());
    }).not.toThrow();

    expect(parsed).toMatchObject({ FOO: 'bar', BAR: '-->bar<--' });
  });

  it('outputs foo and bar keys only', async () => {
    const dir = temporaryDirectory();
    const file = join(dir, 'env.yaml');
    const envVar: Source = {
      vars: { BAR: { value: 'boop' } },
      filter: ['FOO', 'BAR'],
    };

    writeFileSync(file, stringify(envVar), 'utf8');

    const { stdout, exitCode } = await execa(
      'node',
      [CLI_PATH, '--json', '-vvv', 'compile', '--keys-only', file],
      {
        reject: false,
        env: { FOO: 'bar' },
      },
    );
    expect(exitCode).toBe(0);

    let parsed;
    expect(() => {
      parsed = JSON.parse(stdout.trim());
    }).not.toThrow();

    expect(parsed).toMatchObject(['FOO', 'BAR']);
  });

  it('filters incoming env vars', async () => {
    const GOOD_VAR = { FOO: 'should appear' };
    const BAD_VAR = { BAR: 'should not appear' };

    const dir = temporaryDirectory();
    const sourceFile = join(dir, 'env.yaml');
    const envVar: Source = {
      vars: {},
    };

    writeFileSync(sourceFile, stringify(envVar), 'utf8');

    const configFile = join(dir, 'config.yaml');
    const configVar: Config = {
      inbound_filter: Object.keys(GOOD_VAR),
      vars: {},
      sources: {},
      keys: {},
    };

    writeFileSync(configFile, stringify(configVar), 'utf8');

    const { stdout, exitCode } = await execa(
      'node',
      [CLI_PATH, '--json', '-vvv', '--config', configFile, 'compile', sourceFile],
      {
        reject: false,
        env: { ...GOOD_VAR, ...BAD_VAR },
      },
    );

    expect(exitCode).toBe(0);

    let parsed;
    expect(() => {
      parsed = JSON.parse(stdout.trim());
    }).not.toThrow();

    expect(parsed).not.toMatchObject(BAD_VAR);
    expect(parsed).toMatchObject(GOOD_VAR);
  });

  it('filters adds env vars from config file', async () => {
    const ENV_VARS = { FOO: 'should appear' };
    const CONFIG_ENV_VARS = { BAR: 'should also appear' };

    const dir = temporaryDirectory();
    const configFile = join(dir, 'config.yaml');
    const configVar: Config = {
      inbound_filter: Object.keys(ENV_VARS),
      vars: CONFIG_ENV_VARS,
      sources: {},
      keys: {},
    };

    writeFileSync(configFile, stringify(configVar), 'utf8');

    const { stdout, exitCode } = await execa(
      'node',
      [CLI_PATH, '--json', '-vvv', '--config', configFile, 'compile'],
      {
        reject: false,
        env: ENV_VARS,
      },
    );

    expect(exitCode).toBe(0);

    let parsed;
    expect(() => {
      parsed = JSON.parse(stdout.trim());
    }).not.toThrow();

    expect(parsed).toMatchObject({ ...CONFIG_ENV_VARS, ...ENV_VARS });
  });

  it('outputs decrypted value when env var is encrypted', async () => {
    const ENCRYPTION_KEY = aes256GcmGenerateKey();
    const plaintext = 'secret-bar';

    const dir = temporaryDirectory();

    const file = join(dir, 'env.yaml');
    const envVar: Source = {
      vars: {
        BAR: {
          encrypted: aes256GcmEncrypt({ plaintext, key: ENCRYPTION_KEY, encoding: 'base64' }),
          encryption_algorithm: 'aes-256-gcm',
          encryption_encoding: 'base64',
          encryption_key_name: 'ENCRYPTION_KEY',
        },
      },
      filter: ['BAR'],
    };

    writeFileSync(file, stringify(envVar), 'utf8');

    const { stdout, exitCode } = await execa('node', [CLI_PATH, '--json', 'compile', file], {
      reject: false,
      env: { ENCRYPTION_KEY },
    });

    expect(exitCode).toBe(0);

    let parsed;
    expect(() => {
      parsed = JSON.parse(stdout.trim());
    }).not.toThrow();

    expect(parsed).toMatchObject({ BAR: 'secret-bar' });
  });

  describe('external validation', () => {
    it('passes validation when command exits with 0', async () => {
      const dir = temporaryDirectory();
      const file = join(dir, 'env.yaml');
      const envVar: Source = {
        vars: {
          FOO: {
            value: 'valid-value',
            validator: 'true',
          },
        },
        filter: ['FOO'],
      };

      writeFileSync(file, stringify(envVar), 'utf8');

      const { stdout, exitCode } = await execa('node', [CLI_PATH, '--json', 'compile', file], {
        reject: false,
      });

      expect(exitCode).toBe(0);

      let parsed;
      expect(() => {
        parsed = JSON.parse(stdout.trim());
      }).not.toThrow();

      expect(parsed).toMatchObject({ FOO: 'valid-value' });
    });

    it('fails validation when command exits with non-0', async () => {
      const dir = temporaryDirectory();
      const file = join(dir, 'env.yaml');
      const envVar: Source = {
        vars: {
          FOO: {
            value: 'invalid-value',
            validator: 'false',
          },
        },
        filter: ['FOO'],
      };

      writeFileSync(file, stringify(envVar), 'utf8');

      const { stdout, exitCode, stderr } = await execa(
        'node',
        [CLI_PATH, '--json', 'compile', file],
        {
          reject: false,
        },
      );

      expect(exitCode).not.toBe(0);
      expect(stderr).toContain('External validation failed');
      expect(stdout.trim()).toBe('');
    });
  });

  describe('has format validation', () => {
    it('passes validation if format matches', async () => {
      const dir = temporaryDirectory();
      const file = join(dir, 'env.yaml');
      const envVar: Source = {
        vars: {
          FOO: {
            value: 'abc123',
            format: 'string',
          },
        },
        filter: ['FOO'],
      };

      writeFileSync(file, stringify(envVar), 'utf8');

      const { stdout, exitCode } = await execa('node', [CLI_PATH, '--json', 'compile', file], {
        reject: false,
      });

      expect(exitCode).toBe(0);

      let parsed;
      expect(() => {
        parsed = JSON.parse(stdout.trim());
      }).not.toThrow();

      expect(parsed).toMatchObject({ FOO: 'abc123' });
    });

    it('fails validation if format does not match', async () => {
      const dir = temporaryDirectory();
      const file = join(dir, 'env.yaml');
      const envVar: Source = {
        vars: {
          FOO: {
            value: 'xyz789',
            format: 'email',
          },
        },
        filter: ['FOO'],
      };

      writeFileSync(file, stringify(envVar), 'utf8');

      const { stdout, exitCode, stderr } = await execa(
        'node',
        [CLI_PATH, '--json', 'compile', file],
        {
          reject: false,
        },
      );

      expect(exitCode).not.toBe(0);
      expect(stderr).toContain('Format validation failed');
      expect(stdout.trim()).toBe('');
    });
  });

  describe('uniqueness validation', () => {
    it('passes validation if value is unique', async () => {
      const dir = temporaryDirectory();
      const file = join(dir, 'env.yaml');
      const envVar: Source = {
        vars: {
          FOO: {
            value: 'unique-value-1',
            unique: ['FOO', 'BAR'],
          },
          BAR: {
            value: 'unique-value-2',
            unique: ['FOO', 'BAR'],
          },
        },
        filter: ['FOO', 'BAR'],
      };

      writeFileSync(file, stringify(envVar), 'utf8');

      const { stdout, exitCode } = await execa('node', [CLI_PATH, '--json', 'compile', file], {
        reject: false,
      });

      expect(exitCode).toBe(0);

      let parsed;
      expect(() => {
        parsed = JSON.parse(stdout.trim());
      }).not.toThrow();

      expect(parsed).toMatchObject({ FOO: 'unique-value-1', BAR: 'unique-value-2' });
    });

    it('fails validation if value is not unique', async () => {
      const dir = temporaryDirectory();
      const file = join(dir, 'env.yaml');
      const envVar: Source = {
        vars: {
          FOO: {
            value: 'not-unique',
            unique: ['FOO', 'BAR'],
          },
          BAR: {
            value: 'not-unique',
            unique: ['FOO', 'BAR'],
          },
        },
        filter: ['FOO', 'BAR'],
      };

      writeFileSync(file, stringify(envVar), 'utf8');

      const { stdout, exitCode, stderr } = await execa(
        'node',
        [CLI_PATH, '--json', 'compile', file],
        {
          reject: false,
        },
      );

      expect(exitCode).not.toBe(0);
      expect(stderr).toContain(
        'Uniqueness check failed for variable FOO with value not-unique, same as BAR',
      );
      expect(stdout.trim()).toBe('');
    });
  });

  describe('regexp validation', () => {
    it('passes validation if string match', async () => {
      const dir = temporaryDirectory();
      const file = join(dir, 'env.yaml');
      const envVar: Source = {
        vars: {
          FOO: {
            value: 'abc123',
            regexp: '^abc\\d+$',
          },
        },
        filter: ['FOO'],
      };

      writeFileSync(file, stringify(envVar), 'utf8');

      const { stdout, exitCode } = await execa('node', [CLI_PATH, '--json', 'compile', file], {
        reject: false,
      });

      expect(exitCode).toBe(0);

      let parsed;
      expect(() => {
        parsed = JSON.parse(stdout.trim());
      }).not.toThrow();

      expect(parsed).toMatchObject({ FOO: 'abc123' });
    });

    it('fails validation if string does not match', async () => {
      const dir = temporaryDirectory();
      const file = join(dir, 'env.yaml');
      const envVar: Source = {
        vars: {
          FOO: {
            value: 'xyz789',
            regexp: '^abc\\d+$',
          },
        },
        filter: ['FOO'],
      };

      writeFileSync(file, stringify(envVar), 'utf8');

      const { stdout, exitCode, stderr } = await execa(
        'node',
        [CLI_PATH, '--json', 'compile', file],
        {
          reject: false,
        },
      );

      expect(exitCode).not.toBe(0);
      expect(stderr).toContain('Value does not match regexp');
      expect(stdout.trim()).toBe('');
    });
  });
});
