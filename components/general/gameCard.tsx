"use client";

import { Game } from "@/lib/games";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

export default function GameCard({ game }: { game: Game }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div
      className="flex flex-col max-sm:w-full items-center justify-center bg-accent-100 rounded-xl p-5 cursor-pointer hover:bg-secondary-100 transition-all duration-200 ease-out"
      onClick={() => router.push(`/games/${game.route}`)}
    >
      <Image
        src={`/game-icons/${game.icon}`}
        alt={game.name}
        width="200"
        height="200"
      />
      <button
        className={`${
          pathname === `/games/${game.route}`
            ? "text-primary-500"
            : "text-primary-900"
        } font-bold text-xl text-center hover:text-secondary-600 transition-all duration-200 ease-in-out`}
      >
        {game.name}
      </button>
    </div>
  );
}
