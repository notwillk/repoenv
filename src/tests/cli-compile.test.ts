import { execa } from 'execa';
import { describe, it, expect } from 'vitest';
import { CLI_PATH } from './constants';

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
});
