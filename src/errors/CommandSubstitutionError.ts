export default class CommandSubstitutionError extends Error {
  command: string;
  stderr: string;
  status: unknown;

  constructor({ command, stderr, status }: { command: string; stderr: string; status: unknown }) {
    super(`Command (${command}) exited with ${status}:\n${stderr}`);
    this.name = 'CommandSubstitutionError';
    this.status = status;
    this.command = command;
    this.stderr = stderr;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
