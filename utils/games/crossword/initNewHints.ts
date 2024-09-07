import { CrosswordHints } from "@/app/games/crossword/page";

export default function initNewHints() {
  let hints: CrosswordHints = {
    across: [],
    down: [],
  };

  return hints;
}
