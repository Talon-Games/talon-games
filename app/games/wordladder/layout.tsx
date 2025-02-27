"use client";

import ConnectedButton from "@/components/general/connectedButtons";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  useWordLadderContext,
  WordLadderContextProvider,
} from "@/lib/contexts/wordLadderContext";

export default function WordLadderLayout({ children }: { children: any }) {
  return (
    <WordLadderContextProvider>
      <WordLadderContent>{children}</WordLadderContent>
    </WordLadderContextProvider>
  );
}

function WordLadderContent({ children }: { children: any }) {
  const router = useRouter();
  const { updateCurrentMode } = useWordLadderContext() as {
    updateCurrentMode: (mode: "today" | "archive") => void;
  };

  const [currentView, setCurrentView] = useState<"today" | "archive">("today");

  useEffect(() => {
    const url = new URL(window.location.href);

    if (url.toString().includes("archive")) {
      setCurrentView("archive");
      updateCurrentMode("archive");
    } else {
      setCurrentView("today");
      updateCurrentMode("today");
    }
  }, []);

  const gotoToday = () => {
    setCurrentView("today");
    router.push(`/games/wordladder`);
    updateCurrentMode("today");
  };

  const gotoArchive = () => {
    setCurrentView("archive");
    router.push(`/games/wordladder/archive`);
  };

  return (
    <main className="w-9/12 ml-auto mr-auto max-lg:w-10/12 max-sm:w-11/12">
      <h1 className="font-heading text-center mb-4 text-8xl max-sm:text-7xl max-xs:text-6xl">
        Word Ladder
      </h1>
      <ConnectedButton
        onClickLeft={gotoToday}
        onClickRight={gotoArchive}
        leftStyle="normal"
        rightStyle="normal"
        leftTitle="Todays Word Ladder"
        rightTitle="Word Ladder Archive"
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
