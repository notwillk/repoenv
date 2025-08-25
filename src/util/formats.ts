const reEscape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const joinAlt = (arr: readonly string[]) => arr.map(reEscape).join('|');

type Formats = {
  staticFormats: readonly string[];
  integerModifiedFormats: readonly string[];
  floatModifiedFormats: readonly string[];
};

function wholeString(s: string) {
  return `^${s}$`;
}

function nonCapturingGroup(s: string) {
  return `(?:${s})`;
}

export function getFormatRegex({
  staticFormats,
  integerModifiedFormats,
  floatModifiedFormats,
}: Formats) {
  const intBody = '(?:(?<intMin>\\d+),(?<intMax>\\d+)|,(?<intRight>\\d+)|(?<intSingle>\\d+))';
  const floatNum = '\\d+(?:\\.\\d*)?';
  const floatBody =
    `((?<floatMin>${floatNum}),(?<floatMax>${floatNum})|,` +
    `(?<floatRight>${floatNum})|(?<floatSingle>${floatNum}))`;

  return new RegExp(
    wholeString(
      nonCapturingGroup(
        [
          `(?<static>${joinAlt(staticFormats)})`,
          `(?<intType>${joinAlt(integerModifiedFormats)})(?:[\\[(]${intBody}[\\])])?`,
          `(?<floatType>${joinAlt(floatModifiedFormats)})(?:[\\[(]${floatBody}[\\])])?`,
        ].join('|'),
      ),
    ),
  );
}
