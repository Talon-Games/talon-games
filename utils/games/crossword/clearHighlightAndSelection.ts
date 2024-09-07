import { CrossWordBoxData } from "@/app/games/crossword/page";

export default function clearHighlightAndSelection(data: CrossWordBoxData[][]) {
  return data.map((row) =>
    row.map((box) => ({
      ...box,
      state:
        box.state === "highlighted" || box.state === "selected"
          ? "normal"
          : box.state,
    })),
  );
}
