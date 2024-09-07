import { CrossWordBoxData } from "@/app/games/crossword/page";

export default function detectWin(data: CrossWordBoxData[][]): boolean {
  for (let y = 0; y < data.length; y++) {
    for (let x = 0; x < data.length; x++) {
      if (data[y][x].state == "black") {
        continue;
      }

      if (data[y][x].guess != data[y][x].answer) {
        return false;
      }
    }
  }

  return true;
}
