import { Crossword } from "@/app/games/crossword/page";

export default function decodeJsonData(data: string): Crossword {
  let jsonCrossword = JSON.parse(data);

  let crossword: Crossword = {
    data: jsonCrossword.data,
    hints: jsonCrossword.hints,
    author: jsonCrossword.author,
    published: jsonCrossword.published,
  };

  return crossword;
}