import { Chalk, ChalkInstance } from 'chalk';
import util from 'node:util';

const LEVELS = ['debug', 'info', 'warn', 'error', 'off'] as const;

type Level = (typeof LEVELS)[number];

type LogStringAndMetadataArgs = [string, Record<string, unknown>?];
type LogFunctionArgs = [(chalk: ChalkInstance) => string | [string, Record<string, unknown>]];
type LogArgs = LogStringAndMetadataArgs | LogFunctionArgs;

function levelCompare(a: Level, b: Level) {
  return LEVELS.indexOf(a) - LEVELS.indexOf(b);
}

class Logger {
  _level: Level = 'warn';
  _chalk: ChalkInstance = new Chalk({ level: 3 });
  _color: boolean = true;

  setColor(enabled: boolean) {
    this._chalk = new Chalk({ level: enabled ? 3 : 0 });
    this._color = enabled;
  }

  setCalculatedLevel({ quiet, verbose }: { verbose: number; quiet: boolean }) {
    if (quiet) {
      this.setLevel('error');
    } else if (verbose >= 2) {
      this.setLevel('debug');
    } else if (verbose === 1) {
      this.setLevel('info');
    } else {
      this.setLevel('warn');
    }
    this.debug(`Log level set to ${this._level}`);
  }

  setLevel(level: Level) {
    this._level = level;
  }

  debug(...args: LogArgs) {
    this.log('debug', ...args);
  }

  info(...args: LogArgs) {
    this.log('info', ...args);
  }

  warn(...args: LogArgs) {
    this.log('warn', ...args);
  }

  error(...args: LogArgs) {
    this.log('error', ...args);
  }

  protected log(level: Level, ...args: LogArgs) {
    if (levelCompare(level, this._level) < 0) return;

    const printStr = (s: string) => console.log(s);
    const printObj = (o: unknown) =>
      console.log(util.inspect(o, { colors: this._color, depth: null, compact: false }));

    if (typeof args[0] === 'function') {
      const out = args[0](this._chalk);
      if (Array.isArray(out)) {
        const [msg, meta] = out;
        if (typeof msg === 'string') {
          printStr(msg);
        } else {
          printObj(msg);
        }
        if (this._level === 'debug' && meta !== undefined) {
          printObj(meta);
        }
      } else {
        if (typeof out === 'string') {
          printStr(out);
        } else {
          printObj(out);
        }
      }
      return;
    }

    const [msg, meta] = args;
    if (typeof msg === 'string') {
      printStr(msg);
    } else {
      printObj(msg);
    }
    if (this._level === 'debug' && meta !== undefined) {
      printObj(meta);
    }
  }
}

export default new Logger();
