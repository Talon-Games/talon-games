import games from "@/lib/games";
import { Game } from "@/lib/games";
import GameCard from "./gameCard";

export default function GameNavBar() {
  return (
    <nav className="flex items-center justify-center gap-10 w-full max-sm:flex-col">
      {games.map((game: Game) => (
        <GameCard game={game} key={game.name} />
      ))}
    </nav>
  );
}
