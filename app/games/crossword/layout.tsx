"use client";

import ConnectedButton from "@/components/general/connectedButtons";
import { useGamesContext } from "@/lib/contexts/gamesContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CrosswordLayout({ children }: { children: any }) {
  const router = useRouter();
  const { crosswordSize, updateSize, updateCurrentMode } =
    useGamesContext() as {
      crosswordSize: { width: number; height: number; size: "mini" | "full" };
      updateSize: (size: "mini" | "full") => void;

      updateCurrentMode: (mode: "today" | "archive") => void;
    };
  const [currentView, setCurrentView] = useState<"today" | "archive">("today");
  const url = new URL(window.location.href);

  useEffect(() => {
    let type = url.searchParams.get("type");
    let size: "full" | "mini" = "full";
    if (type == "mini") {
      size = "mini";
    }

    if (url.toString().includes("archive")) {
      setCurrentView("archive");
      updateCurrentMode("archive");
    } else {
      setCurrentView("today");
      updateCurrentMode("today");
    }

    if (size == "mini") {
      updateSize("mini");
    } else {
      updateSize("full");
    }
  }, []);

  const gotoToday = () => {
    setCurrentView("today");
    router.push(`/games/crossword?type=${crosswordSize.size}`);
    updateCurrentMode("today");
  };

  const gotoArchive = () => {
    setCurrentView("archive");
    router.push(`/games/crossword/archive?type=${crosswordSize.size}`);
  };

  return (
    <main className="w-9/12 ml-auto mr-auto max-sm:w-11/12">
      <h1 className="font-heading text-center mb-4 text-8xl max-sm:text-7xl max-xs:text-6xl">
        {crosswordSize.size == "full" ? "Crossword" : "Mini Crossword"}
      </h1>
      <ConnectedButton
        onClickLeft={gotoToday}
        onClickRight={gotoArchive}
        leftStyle="normal"
        rightStyle="normal"
        leftTitle="Todays Crossword"
        rightTitle="Crossword Archive"
        containerClassModifier="mb-2"
        leftClassModifier={
          currentView == "today"
            ? "bg-secondary-500 border-r-2 border-secondary-400"
            : "bg-secondary-400 hover:bg-secondary-500"
        }
        rightClassModifier={
          currentView == "archive"
            ? "bg-secondary-500 border-l-2 border-secondary-400"
            : "bg-secondary-400 hover:bg-secondary-500"
        }
      />
      {children}
    </main>
  );
}
