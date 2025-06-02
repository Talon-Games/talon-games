import { SpellingBee } from "@/app/games/spelling-bee/page";
import { ok, err, Result } from "@/utils/errors";

export default function isValidGuess(
  spellingBee: SpellingBee | undefined,
  guess: string,
  foundWords: string[],
): Result<void, string> {
  if (!spellingBee) {
    return err("No spelling bee loaded");
  }

  if (foundWords.includes(guess)) return err("Already found");

  if (guess.length <= 3) {
    return err("Too short");
  }

  if (!guess.includes(spellingBee.center)) {
    return err("Missing center letter");
  }

  if (spellingBee.answers.includes(guess)) {
    console.log("YES");
    return ok(undefined);
  } else {
    return err("Not in word list");
  }
}
