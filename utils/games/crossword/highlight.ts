import { CrossWordBoxData } from "@/app/games/crossword/page";

export default function highlight(
  x: number,
  y: number,
  direction: "across" | "down" | "both",
  onlyDirections: boolean,
  data: CrossWordBoxData[][],
): CrossWordBoxData[][] {
  if (data[y][x].state === "black") return data;

  // Rest non-black boxes
  data.forEach((row) =>
    row.forEach((box) => {
      if (box.state !== "black") box.state = "normal";
    }),
  );

  // Highlight in specified directions
  if (direction === "across" || direction === "both") {
    if (!onlyDirections) {
      for (let i = x; i >= 0; i--) {
        if (data[y][i].state === "black") break;
        if (data[y][i].number) {
          data[y][i].state = "highlighted";
          break;
        }
        data[y][i].state = "highlighted";
      }
    }
    for (let i = x; i < data.length; i++) {
      if (data[y][i].state === "black") break;
      data[y][i].state = "highlighted";
    }
  }

  if (direction === "down" || direction === "both") {
    if (!onlyDirections) {
      for (let i = y; i >= 0; i--) {
        if (data[i][x].state === "black") break;
        if (data[i][x].number) {
          data[i][x].state = "highlighted";
          break;
        }
        data[i][x].state = "highlighted";
      }
    }
    for (let i = y; i < data.length; i++) {
      if (data[i][x].state === "black") break;
      data[i][x].state = "highlighted";
    }
  }

  data[y][x].state = "selected";
  return data;
}
