import { CrossWordBoxData } from "@/app/games/crossword/page";

export default function selectCurrent(
  x: number,
  y: number,
  data: CrossWordBoxData[][],
): CrossWordBoxData[][] {
  for (let y = 0; y < data.length; y++) {
    for (let x = 0; x < data.length; x++) {
      if (data[y][x].state == "selected") {
        data[y][x].state = "normal";
      }
    }
  }

  if (data[y][x].state == "black") return data;
  data[y][x].state = "selected";

  return data;
}
