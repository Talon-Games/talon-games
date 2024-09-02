"use client";

import { Game } from "@/lib/games";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "./button";

export default function GameCard({ game }: { game: Game }) {
  const router = useRouter();

  // fuck tailwind
  const getColor = (color: string) => {
    switch (color) {
      case "crossword":
        return "bg-blue-300";
      case "mini-crossword":
        return "bg-green-300";
    }
  };

  return (
    <div className="flex w-5/6 min-h-96 max-sm:w-[98%] max-sm:flex-col rounded-xl hover:drop-shadow-lg bg-accent-100 transition-all duration-300 ease-in-out">
      <div
        className={`flex items-center justify-center w-4/6 max-lg:w-3/6 rounded-tl-xl max-sm:w-full max-sm:rounded-tr-xl sm:rouned-bl-xl ${getColor(
          game.color,
        )}`}
      >
        <Image
          className="max-lg:w-[300px] max-lg:h-[300px]"
          src={`/game-icons/${game.icon}`}
          alt={game.name}
          width="400"
          height="400"
        />
      </div>
      <div className="w-2/6 p-4 flex flex-col items-center justify-between max-lg:w-3/6 max-sm:w-full">
        <div>
          <h2 className="font-bold text-4xl text-center font-heading">
            {game.name}
          </h2>
          <p className="w-5-6">{game.description}</p>
        </div>
        <Button
          onClick={() => router.push(`/games/${game.route}`)}
          disabled={game.commingSoon ? true : false}
          title={game.commingSoon ? "Comming Soon" : "Play"}
          classModifier="p-5 bg-secondary-400 hover:bg-secondary-500 !w-5/6"
        />
      </div>
    </div>
  );
}
