export type Word = {
  word: string;
  meaning: string;
};

export default async function loadWords(): Promise<Word[]> {
  const response = await fetch(
    "https://raw.githubusercontent.com/cqb13/spelling-bee-solver/refs/heads/main/words.txt",
  );

  const text = await response.text();
  const lines = text.split("\n");

  let words: Word[] = [];

  lines.forEach((line: string) => {
    // The ,( check removes words that might be from other languages
    if (line == "" || line.includes(",(")) return;
    let parts = line.split(",");

    words.push({ word: parts[0], meaning: parts[1] });
  });

  return words;
}
