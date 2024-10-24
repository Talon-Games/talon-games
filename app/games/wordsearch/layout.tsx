"use client";

import { useGamesContext } from "@/lib/contexts/gamesContext";
import ConnectedButton from "@/components/general/connectedButtons";
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

  useEffect(() => {
    const url = new URL(window.location.href);
    let type = url.searchParams.get("type");

    let size: "full" | "mini" = "full";
    if (type == "mini") {
      size = "mini";
    }

    if (url.toString().includes("archive")) {
      setCurrentView("archive");
    } else {
      setCurrentView("today");
    }

    if (size == "mini") {
      updateSize("mini");
    } else {
      updateSize("full");
    }
  }, []);

  const switchView = () => {
    if (currentView == "today") {
      setCurrentView("archive");
      router.push(`/games/crossword/archive?type=${crosswordSize.size}`);
    } else {
      setCurrentView("today");
      router.push(`/games/crossword?type=${crosswordSize.size}`);
      updateCurrentMode("today");
    }
  };

  return (
    <main className="w-9/12 ml-auto mr-auto max-sm:w-11/12">
      <h1 className="font-heading text-center mb-4 text-8xl max-sm:text-7xl max-xs:text-6xl">
        {crosswordSize.size == "full" ? "Crossword" : "Mini Crossword"}
      </h1>
      <ConnectedButton
        onClickLeft={switchView}
        onClickRight={switchView}
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
