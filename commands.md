# Commands

## `init`

Create new, blank config file

### Options

```typescript
type Options = {
  verbose: 'error' | 'debug' | 'info' | 'warn' | 'off';
  quiet: boolean;
  color: boolean;
  json: boolean;
  config: string /* path to config */;
  force: boolean;
};
```

### File(s)

N/A

### Procedure

1. Confirm config file does not exist, continue only if no-file or `force === true`
2. Create a basic config file

### Outputs

| stdout | strerr          | fs              |
| ------ | --------------- | --------------- |
| N/A    | debug/info logs | new config file |

### Errors

- `ConfigFileExistsError`

## `keyinit`

Initialize a new encryption/signing key

### Options

```typescript
type Options = {
  verbose: 'error' | 'debug' | 'info' | 'warn' | 'off';
  quiet: boolean;
  color: boolean;
  json: boolean;
  config: string /* path to config */;
  algorithm: string /* e.g. 'aes-256-gcm' */;
  keyname: string;
};
```

### File(s)

- Config file

### Procedure

1. Read file, add new key unless already exists

### Outputs

| stdout | strerr          | fs                  |
| ------ | --------------- | ------------------- |
| N/A    | debug/info logs | updated config file |

### Errors

- `UninitializedConfigError`
- `ExistingSecretKeyError`
- `UnsupportedAlgorithmError`

## `compile`

<!-- description -->

### Options

```typescript
type Options = {
  verbose: 'error' | 'debug' | 'info' | 'warn' | 'off';
  quiet: boolean;
  color: boolean;
  json: boolean;
  config: string /* path to config */;
  keysOnly: boolean;
  service: string;
};
```

### File(s)

- Config file
- Service file

### Procedure

1. Read config file
2. Read service file(s)
3. Parse/decrypt/substitute, validate, merge, filter vairables: env var, config, each service file
4. Output compiled env vars

### Outputs

| stdout            | strerr          | fs  |
| ----------------- | --------------- | --- |
| compiled env vars | debug/info logs | N/A |

### Errors

- `UndefinedServiceError`

<!-- ## `tbd`

<!-- description

### Options

```typescript
type Options = {
  verbose: 'error' | 'debug' | 'info' | 'warn' | 'off';
  quiet: boolean;
  color: boolean;
  json: boolean;
  config: string /* path to config */;
};
```

### File(s)

- <!-- Files that are read

### Procedure

1. Step 1

### Outputs

| stdout | strerr          | fs  |
| ------ | --------------- | --- |
|        | debug/info logs |     |

### Errors

- Errors -->
