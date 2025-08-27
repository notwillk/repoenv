export default class CommandSubstitutionError extends Error {
  command: string;
  stderr: string;
  status: any;

  constructor({ command, stderr, status }: { command: string; stderr: string; status: any }) {
    super(`Command (${command}) exited with ${status}:\n${stderr}`);
    this.name = 'CommandSubstitutionError';
    this.status = status;
    this.command = command;
    this.stderr = stderr;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
