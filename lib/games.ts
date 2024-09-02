export type Game = {
  name: string;
  description: string;
  color: string;
  route: string;
  icon: string;
};

// add the color to whatever thing i put in GameNavBar with a bunch of colors in it
const games: Game[] = [
  {
    name: "Crossword",
    description:
      "A crossword game that challenges your vocabulary and problem-solving skills! Each puzzle is filled with clues that will test your knowledge across a variety of topics. As you fill in the grid, you’ll uncover hidden words and phrases, making each game a fun and educational experience. Perfect for sharpening your mind and taking a break between classes, our crossword game is the ultimate brain teaser for students of all levels. Dive in and see if you can complete the puzzle!",
    color: "crossword",
    route: "/crossword",
    icon: "crossword.svg",
  },
  {
    name: "Game 1",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    color: "1",
    route: "/crossword",
    icon: "crossword.svg",
  },
  {
    name: "Game 2",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    color: "2",
    route: "/crossword",
    icon: "crossword.svg",
  },
  {
    name: "Game 3",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    color: "3",
    route: "/crossword",
    icon: "crossword.svg",
  },
];

export default games;
