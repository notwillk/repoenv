import path from 'node:path';

export default function makeAbsolutePath(
  relativeOrAbsolutePath: string,
  baseDirectory?: string,
): string {
  if (path.isAbsolute(relativeOrAbsolutePath)) {
    return relativeOrAbsolutePath;
  }
  return path.resolve(baseDirectory ?? process.cwd(), relativeOrAbsolutePath);
}
