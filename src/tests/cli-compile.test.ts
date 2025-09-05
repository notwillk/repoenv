import { temporaryDirectory } from 'tempy';
import { execa } from 'execa';
import { describe, it, expect } from 'vitest';
import { CLI_PATH } from './constants';
import { join } from 'node:path';
import { writeFileSync } from 'node:fs';
import { stringify } from 'yaml';
import SourceSchema from '@/schemas/source';
import z from 'zod';

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
    const envVar: z.infer<typeof SourceSchema> = {
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
    const envVar: z.infer<typeof SourceSchema> = {
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
});
