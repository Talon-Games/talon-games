import { CrossWordBoxData } from "@/app/games/crossword/page";

export default function generateNewTable(width: number, height: number) {
  let table: CrossWordBoxData[][] = [];

  for (let i = 0; i < height; i++) {
    let row: CrossWordBoxData[] = [];

    for (let j = 0; j < width; j++) {
      let box: CrossWordBoxData = {
        answer: "",
        guess: "",
        belongsTo: [],
        state: "normal",
      };
      row.push(box);
    }

    table.push(row);
  }

  return table;
}
