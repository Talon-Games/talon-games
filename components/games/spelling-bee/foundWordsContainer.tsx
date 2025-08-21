import isPangram from "@/utils/games/spelling-bee/isPangram";
import { SpellingBee } from "@/app/games/spelling-bee/page";

export default function FoundWordsContainer({
  spellingBee,
  foundWords,
}: {
  spellingBee: SpellingBee | undefined;
  foundWords: string[];
}) {
  if (!spellingBee) return null;
  return (
    <section className="border-black border-2 rounded w-full h-[40rem] max-lg:h-[30rem] flex flex-col p-2">
      <div className="flex gap-1">
        You have found{" "}
        <p className="text-secondary-400 font-semibold">{foundWords.length}</p>{" "}
        {`${foundWords.length == 1 ? "word" : "words"}`}
      </div>
      <div className="columns-3 gap-4 overflow-y-auto h-full">
        {[...foundWords].sort().map((word: string, key: number) => (
          <p
            key={key}
            className={`first-letter:uppercase break-inside-avoid ${isPangram(spellingBee.center, spellingBee.outer, word) ? "font-semibold text-secondary-400" : null}`}
          >
            {word}
          </p>
        ))}
      </div>
    </section>
  );
}
