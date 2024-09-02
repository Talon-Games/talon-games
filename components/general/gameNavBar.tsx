import games from "@/lib/games";
import { Game } from "@/lib/games";
import GameCard from "./gameCard";

export default function GameNavBar() {
  return (
    <nav className="mt-2 flex flex-col items-center justify-center gap-2 w-full">
      {games.map((game: Game) => (
        <GameCard game={game} key={game.name} />
      ))}
    </nav>
  );
}
