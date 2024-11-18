"use client";

import { useRouter } from "next/navigation";
import { Game } from "@/lib/games";
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
      case "wordsearch":
        return "bg-orange-300";
    }
  };

  return (
    <div className="flex-col w-2/6 min-h-96 rounded-xl hover:drop-shadow-lg bg-accent-100 transition-all duration-300 ease-in-out">
      <div
        className={`flex items-center justify-center  rounded-t-xl ${getColor(
          game.color,
        )}`}
      >
        <Image
          className="p-5"
          src={`/game-icons/${game.icon}`}
          alt={game.name}
          width="300"
          height="300"
        />
      </div>
      <div className=" p-4 flex flex-col items-center justify-between max-lg:w-3/6 max-sm:w-full">
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
          style="normal"
          classModifier="p-5 !w-5/6"
        />
      </div>
    </div>
  );
}
