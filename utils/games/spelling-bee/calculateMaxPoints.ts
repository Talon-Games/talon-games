import calculatePointsForGuess from "./calculatePointsForGuess";

export default function calculateMaxPoints(words: string[]): number {
  let maxPoints = 0;

  words.forEach((word: string) => {
    maxPoints += calculatePointsForGuess(word);
  });

  return maxPoints;
}
