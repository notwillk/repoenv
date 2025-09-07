import { describe, it, expect } from 'vitest';
import validationExecutor from './validationExecutor';

const GOOD_COMMAND = `cat`;
const BAD_COMMAND = 'grep -qx expected';

describe('validationExecutor', () => {
  it('should return ok: true for a command that succeeds', () => {
    const result = validationExecutor({ command: GOOD_COMMAND, value: 'hello' });
    expect(result.ok).toBe(true);
    expect(result.error).toBeNull();
  });

  it('should return ok: false for a command that fails', () => {
    const result = validationExecutor({ command: BAD_COMMAND, value: 'test' });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Command failed with status code 1');
  });

  it('should handle empty input', () => {
    const result = validationExecutor({ command: GOOD_COMMAND, value: '' });
    expect(result.ok).toBe(true);
    expect(result.error).toBeNull();
  });

  it('should handle invalid command', () => {
    const result = validationExecutor({ command: 'invalidcommand', value: 'test' });
    expect(result.ok).toBe(false);
    expect(result.error).toContain(': not found');
  });

  it('should return ok: false and error for a command with syntax error', () => {
    const result = validationExecutor({ command: 'sh -c "exit 2"', value: '' });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Command failed with status code 2');
  });

  it('should return ok: false and error for a command with permission denied', () => {
    // Try to execute /etc/passwd, which is not executable
    const result = validationExecutor({ command: '/etc/passwd', value: '' });
    expect(result.ok).toBe(false);
    expect(result.error).toContain(': Permission denied');
  });

  it('should return ok: false and error for a command that throws', () => {
    const result = validationExecutor({ command: 'sh -c "kill -9 $$"', value: '' });
    expect(result.ok).toBe(false);
    expect(result.error).toBeNull();
  });

  it('should return ok: false and error when command writes to stderr', () => {
    const result = validationExecutor({
      command: 'sh -c "echo \\"Boopity boop\\" 1>&2; exit 1"',
      value: '',
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Boopity boop');
  });
});
