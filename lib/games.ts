export type Game = {
  name: string;
  route: string;
  icon: string;
};

// Note that all routes are placed in games{route}, the "games" parent route is not needed
const games: Game[] = [
  {
    name: "Crossword",
    route: "/crossword",
    icon: "crossword.svg",
  },
];

export default games;
