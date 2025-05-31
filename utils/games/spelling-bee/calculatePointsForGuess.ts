export default function calculatePointsForGuess(guess: string): number {
  if (guess.length <= 4) {
    return 1;
  } else {
    return guess.length;
  }
}
