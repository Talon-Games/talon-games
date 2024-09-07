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
    description:
      "A crossword game that challenges your vocabulary and problem-solving skills! Each puzzle is filled with clues that will test your knowledge across a variety of topics. As you fill in the grid, you’ll uncover hidden words and phrases, making each game a fun and educational experience.",
    color: "crossword",
    route: "/crossword?type=full",
    icon: "crossword-icon.svg",
    commingSoon: false,
  },
  {
    name: "Mini Crossword",
    description:
      "A quick and fun 5x5 puzzle with just 10 clues! Perfect for a short break, this bite-sized crossword offers a challenge without taking up too much time. With a mix of straightforward and clever clues, it’s ideal for a quick brain workout.",
    color: "mini-crossword",
    route: "/crossword?type=mini",
    icon: "mini-crossword-icon.svg",
    commingSoon: false,
  },
];

export default games;
