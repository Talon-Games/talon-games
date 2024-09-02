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
      case "1":
        return "bg-green-300";
      case "2":
        return "bg-orange-300";
      case "3":
        return "bg-pink-300";
    }
  };

  return (
    <div className="flex w-5/6 h-96 max-sm:w-full rounded-xl cursor-pointer hover:drop-shadow-lg bg-accent-100 transition-all duration-300 ease-in-out">
      <div
        className={`flex items-center justify-center w-4/6 rounded-tl-xl rounded-bl-xl ${getColor(
          game.color,
        )}`}
      >
        <Image
          src={`/game-icons/${game.icon}`}
          alt={game.name}
          width="400"
          height="400"
        />
      </div>
      <div className="w-2/6 p-4 flex flex-col items-center justify-between">
        <div>
          <h2 className="font-bold text-4xl text-center font-heading">
            {game.name}
          </h2>
          <p className="w-5-6">{game.description}</p>
        </div>
        <Button
          onClick={() => router.push(`/games/${game.route}`)}
          title="Play"
          classModifier="p-5 bg-secondary-400 hover:bg-secondary-500 !w-5/6"
        />
      </div>
    </div>
  );
}
