import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import output, { OutputFormat } from './output';
import EnvVars from '@/util/EnvVars';
import logger from './logger';

vi.mock('./logger', () => ({
  default: {
    debug: vi.fn(),
  },
}));

const mockEnvVars = {
  keys: vi.fn(() => ['KEY1', 'KEY2']),
  toDotenv: vi.fn(() => 'KEY1=value1\nKEY2=value2'),
  toObject: vi.fn(() => ({ KEY1: 'value1', KEY2: 'value2' })),
} as unknown as EnvVars;

describe('output', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('outputs keys only in dotenv format', () => {
    output(mockEnvVars, { keysOnly: true, format: 'dotenv' });
    expect(consoleLogSpy).toHaveBeenCalledWith('KEY1,KEY2');
  });

  it('outputs keys only in json format', () => {
    output(mockEnvVars, { keysOnly: true, format: 'json' });
    expect(consoleLogSpy).toHaveBeenCalledWith(JSON.stringify(['KEY1', 'KEY2'], null, 0));
  });

  it('outputs in dotenv format by default', () => {
    output(mockEnvVars, {});
    expect(logger.debug).toHaveBeenCalledWith('Output format: dotenv');
    expect(consoleLogSpy).toHaveBeenCalledWith('KEY1=value1\nKEY2=value2');
  });

  it('outputs in dotenv format when specified', () => {
    output(mockEnvVars, { format: 'dotenv' });
    expect(logger.debug).toHaveBeenCalledWith('Output format: dotenv');
    expect(consoleLogSpy).toHaveBeenCalledWith('KEY1=value1\nKEY2=value2');
  });

  it('outputs in json format', () => {
    output(mockEnvVars, { format: 'json' });
    expect(logger.debug).toHaveBeenCalledWith('Output format: json');
    expect(consoleLogSpy).toHaveBeenCalledWith('{"KEY1":"value1","KEY2":"value2"}');
  });

  it('throws error for unsupported format', () => {
    expect(() => output(mockEnvVars, { format: 'xml' as OutputFormat })).toThrow(
      'Unsupported output format: xml',
    );
  });
});
