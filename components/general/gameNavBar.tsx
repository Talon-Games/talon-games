import { Game } from "@/lib/games";
import GameCard from "./gameCard";
import games from "@/lib/games";

export default function GameNavBar() {
  return (
    <nav className="mt-2 grid grid-cols-3 items-center justify-center gap-2 w-11/12 max-lg:grid-cols-2 max-sm:grid-cols-1">
      {games.map((game: Game) => (
        <GameCard game={game} key={game.name} />
      ))}
    </nav>
  );
}
