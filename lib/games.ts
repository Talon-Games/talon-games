export type Game = {
  name: string;
  description: string;
  color: string;
  route: string;
  icon: string;
  commingSoon?: boolean;
};

// add the color to whatever thing i put in GameNavBar with a bunch of colors in it
const games: Game[] = [
  {
    name: "Crossword",
    description: "",
    color: "crossword",
    route: "/crossword?type=full",
    icon: "crossword-icon.svg",
    commingSoon: false,
  },
  {
    name: "Mini Crossword",
    description: "",
    color: "mini-crossword",
    route: "/crossword?type=mini",
    icon: "mini-crossword-icon.svg",
    commingSoon: false,
  },
  {
    name: "Word Ladder",
    description: "",
    color: "wordladder",
    route: "/wordladder",
    icon: "word-ladder-icon.svg",
    commingSoon: false,
  },
];

export default games;
