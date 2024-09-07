import { CrossWordBoxData } from "@/app/games/crossword/page";

export default function findNextSelectionSpot(
  data: CrossWordBoxData[][],
  direction: "across" | "down",
  mode: "play" | "build",
  startX: number,
  startY: number,
): { x: number; y: number } {
  if (direction == "across") {
    for (let x = startX + 1; x < data.length; x++) {
      if (
        ((mode == "play" && data[startY][x].guess == "") ||
          (mode == "build" && data[startY][x].answer == "")) &&
        data[startY][x].state != "black"
      ) {
        return { x: x, y: startY };
      } else if (data[startY][x].state == "black") {
        return { x: x - 1, y: startY };
      }
    }
  } else {
    for (let y = startY + 1; y < data.length; y++) {
      if (
        ((data[y][startX].guess == "" && mode == "play") ||
          (mode == "build" && data[y][startX].answer == "")) &&
        data[y][startX].state != "black"
      ) {
        return { x: startX, y: y };
      } else if (data[y][startX].state == "black") {
        return { x: startX, y: y - 1 };
      }
    }
  }

  return { x: startX, y: startY };
}
