import { WordLadderWord } from "@/app/games/wordladder/page";

export default function builtListIsValid(buildList: WordLadderWord[]) {
  const wordLength = buildList[0].word.length;

  for (let i = 0; i < buildList.length; i++) {
    if (buildList[i].word.length != wordLength) {
      return { status: "error", message: "Invalid word length found" };
    }

    if (buildList[i].meaning == "") {
      return { status: "error", message: "Empty meaning found" };
    }
  }

  return { status: "success", message: "All good!" };
}
