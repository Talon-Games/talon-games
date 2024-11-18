import games from "@/lib/games";
import { Game } from "@/lib/games";
import GameCard from "./gameCard";

export default function GameNavBar() {
  return (
    <nav className="mt-2 flex flex-wrap items-center justify-center gap-2 w-11/12">
      {games.map((game: Game) => (
        <GameCard game={game} key={game.name} />
      ))}
    </nav>
  );
}
