# Usage

`repoenv [global options] <command> [command] [args]`

## Global options

Apply to every command:

- `-c, --config <path>` Override config path
- `-v, --verbose` Increase verbosity (repeatable)
- `-q, --quiet` Suppress non-error output
- `--json` Emit machine-readable JSON output
- `--color / --no-color` Force or disable colors in output
- `--dry-run` Show what would happen without making changes
- `-V, --version` Print version
- `-h, --help` Show help

> **Note:** If a command is executed with piped input  
> (e.g. `echo "key_value" | repoenv encrypt VAR_NAME`),  
> the piped value is used as the encryption key.

## Commands

### `lint [--fix] [targets...]`

Validate config and all referenced environment variable files.

- With `--fix`, automatically correct fixable issues.
- `targets...` lets you limit linting to specific files or directories.

### `compile [--redact|--no-redact] <output-file>`

Merge and compile environment variables into `<output-file>`.

- Output is also printed to `stdout`.
- Secrets may be redacted depending on:
  - `--redact` / `--no-redact`
  - The `redact_secrets` setting in the config

### `run [--no-validate] <output-file> -- <command...>`

Compile environment variables into `<output-file>` and run `<command>` with only those variables set.

- By default, values are validated.
- With `--no-validate`, skip validation.

### `encrypt [-f|--file <source-file>] <variable-name>`

Encrypt a plaintext environment variable.

- If `--file` is given, only update that file.
- If no file is provided, all source files are updated.
- Ignores `stdin`, only uses the specified values.

### `unencrypt [-f|--file <source-file>] <variable-name>`

Unecrypt an encrypted environment variable, saves the plaintext value.

- If `--file` is given, only update that file.
- If no file is provided, all source files are updated.

### `rotate [--via <command>]`

Re-encrypt all secrets with a new key.

- Decrypts all current secrets, then re-encrypts with the new key.
- If any decryption fails, no changes are applied.
- With `--via <command>`, the command is stored in the config and executed to fetch the new key.

### `doctor`

Run environment checks:

1. Attempt to fetch the encryption key, reporting status.
2. Run substitution commands, reporting status.

### `init`

Scaffold a new config file (`repoenv.config.{ts,mjs,cjs,js,yaml,yml,json}`).