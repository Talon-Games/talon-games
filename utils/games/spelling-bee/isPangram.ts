export default function isPangram(
  center: string,
  outer: string[],
  guess: string,
): boolean {
  if (!guess.includes(center)) {
    return false;
  }

  let is = true;

  outer.forEach((letter: string) => {
    if (!guess.includes(letter)) {
      is = false;
      return;
    }
  });

  return is;
}
