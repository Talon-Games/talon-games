import { SpellingBee } from "@/app/games/spelling-bee/page";

export default function isPangram(
  currentSpellingBee: SpellingBee | undefined,
  guess: string,
): boolean {
  if (!currentSpellingBee) return false;

  if (!guess.includes(currentSpellingBee.center)) {
    return false;
  }

  let is = true;

  currentSpellingBee.outer.forEach((letter: string) => {
    if (!guess.includes(letter)) {
      is = false;
      return;
    }
  });

  return is;
}
