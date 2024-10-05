import { CrossWordBoxData } from "@/app/games/crossword/page";

export default function getBoxesInDirection(
  startX: number,
  startY: number,
  direction: "across" | "down",
  data: CrossWordBoxData[][],
): { num: number; boxes: { x: number; y: number }[] } {
  let boxes: { num: number; boxes: { x: number; y: number }[] } = {
    num: 0,
    boxes: [],
  };

  if (direction == "across") {
    // scan left till number black or edge
    for (let x = startX; x >= 0; x--) {
      if (data[startY][x].state == "black") {
        break;
      } else if (data[startY][x].number != undefined) {
        let num = data[startY][x].number;
        if (!num) {
          return boxes;
        }
        boxes.num = num;
        boxes.boxes.push({ x: x, y: startY });
      } else {
        boxes.boxes.push({ x: x, y: startY });
      }
    }

    // scan right till black or edge
    for (let x = startX + 1; x < data.length; x++) {
      if (data[startY][x].state == "black") {
        break;
      } else {
        boxes.boxes.push({ x: x, y: startY });
      }
    }
  } else {
    // scan up till number black or edge
    for (let y = startY; y >= 0; y--) {
      if (data[y][startX].state == "black") {
        break;
      } else if (data[y][startX].number != undefined) {
        let num = data[y][startX].number;
        if (!num) {
          return boxes;
        }
        boxes.num = num;
        boxes.boxes.push({ x: startX, y: y });
      } else {
        boxes.boxes.push({ x: startX, y: y });
      }
    }

    // scan down till black or edge
    for (let y = startY + 1; y < data.length; y++) {
      if (data[y][startX].state == "black") {
        break;
      } else {
        boxes.boxes.push({ x: startX, y: y });
      }
    }
  }

  return boxes;
}
