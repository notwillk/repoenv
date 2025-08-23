# Usage

`repoenv [global options] <command> [command] [args]`

## Concepts

There are two concepts, `environments` and `services`.  Environments are defined as a merge of several files, as specified in the config file.  A service is a file merged from the environment file.

Typically all values are set in the environments file(s) (unless a variable is truely only used in that one service), and service files are used for allowlisting and final validation.

## Global options

Apply to every command:

- `--env <name>` Environment name to use
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

### `compile [--redact|--no-redact] [--keys-only]`

Merge and compile environment variables to `stdout`.

- The variables are sorted alphabetically.
- Whitespace is stripped from the values.
- Secrets may be redacted depending on:
  - `--redact` / `--no-redact`
  - The `redact_secrets` setting in the config
- If `--keys-only` is given, only the keys are outputted

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
2. Run substitution commands for the given environment, reporting status.

### `init`

Scaffold a new config file (`repoenv.config.yaml`).

## File formats

### Config file format

> TBD

#### Example
```yaml
version: 0 # Version number, defaults to 'latest'

key:
  via: "echo my_key_value"

sources:
  local:
  - env/base.yaml
  - env/local.yaml
  - override.yaml
  dev:
  - env/base.yaml
  - env/dev.yaml
  prod:
  - env/base.yaml
  - env/prod.yaml
```

### Env var file format

> TBD

#### Example

```yaml
vars:
- BASIC_VAR: "a string, plaintext, unvalidated, unredacted"
- DERIVED_VAR:
  derived_value: "something about $BASIC_VAR"
- SUBSTITUTED_VAR:
  substitution: "some command to fetch the value"
- PLAINTEXT_FANCY_VAR:
  value: "this is my value"
  validator: "some command to validate the value"
- ENCRYPTED_FANCY_VAR:
  ecrypted: "xyz789"
  format: "string"
- BAD_SECRET_VAR:
  value: "my secret value"
  redact: false # note: this will throw a lint error, since the secret is in plaintext
- GOOD_SECRET_VAR:
  ecrypted: "xyz789"
  redact: false
- UNIQUE_VAR_PORT:
  value: "this is my value"
  format: "number"
  unique:
  - "*_PORT"
  - "SOME_VARIABLE"
- REGEX_VALIDATED_VAR:
  value: "boop"
  regexp: "$boop^"
filter:
- "IMPORTANT_VAR"
- "INCLUDED_PATTERN_*"
- "!EXCLUDED_VAR_NAME"
- "!EXCLUDED_PATTERN_*"
validator: "some command to validate entire set of variables"
```

Formats:
- `string`
  - `string[[min-length][,<max-length>]]`
- `url`
- `iso8601`
- `integer`
  - `integer([min][,<max>])`
  - `integer[[min][,<max>]]`
  - `integer[[min][,<max>])`
  - `integer([min][,<max>]]`
- `float`
  - `float([min][,<max>])`
  - `float[[min][,<max>]]`
  - `float[[min][,<max>])`
  - `float([min][,<max>]]`
- `email`
- `ipv4`
- `ipv6`
- `uuid`
- `ulid`
- `base64`
  - `base64[[min-length-in-bits][,<max-length-in-bits>]]`
- `hex`
  - `hex[[min-length-in-bits][,<max-length-in-bits>]]`

Variable dependencies:
- Within a file, the dependency graph of variables is calculated based on `derived_value` and `substitution` values (i.e. `$<varname>`).
- Errors with this are caught via lint
- Errors prevent these values from being calculated
