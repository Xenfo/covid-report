const createAlphabet = () => {
  const alphabet = {};

  const numAlphabet = Array.from(Array(26)).map((_, i) => i + 65);
  const lowercase = numAlphabet
    .map((c, i) => ({ [String.fromCharCode(c).toLowerCase()]: i + 1 }))
    .reduce((acc, curr) => ({ ...acc, ...curr }));
  const uppercase = numAlphabet
    .map((c, i) => ({ [String.fromCharCode(c)]: i + 1 }))
    .reduce((acc, curr) => ({ ...acc, ...curr }));

  return Object.assign(alphabet, lowercase, uppercase);
};

const parseInput = (input: string) => {
  const alphabet = createAlphabet();

  const chars = [];
  for (const c of input) {
    chars.push(c);
  }

  return chars
    .reverse()
    .map((c, i) => {
      const isLetter = (c.match(/[a-zA-Z]/g)?.length ?? 0) > 0;
      if (isLetter) {
        return alphabet[c];
      }

      return Number(`${c}${'0'.repeat(i)}`);
    })
    .reduce((a, b) => a + b, 0);
};

const sort = (a: string, b: string) => {
  const hasLetters = [a, b].map((c) => (c.match(/[a-zA-Z]/g)?.length ?? 0) > 0);
  if (!hasLetters.includes(true)) return Number(a) - Number(b);

  if (!hasLetters.includes(false)) {
    if (a.startsWith('P') && b.startsWith('K')) return -1;
    else if (a.startsWith('K') && b.startsWith('P')) return 1;
    else if (a.startsWith('P') || a.startsWith('K')) return -1;
    else if (b.startsWith('P') || b.startsWith('K')) return 1;

    return parseInput(a) - parseInput(b);
  }

  if (hasLetters.includes(true) && hasLetters.includes(false)) {
    if (
      a.startsWith('K') ||
      a.startsWith('P') ||
      b.startsWith('K') ||
      b.startsWith('P')
    )
      return 1;

    return parseInput(a) - parseInput(b);
  }

  return 0;
};

export default sort;
