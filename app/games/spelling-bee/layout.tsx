"use client";

import ConnectedButton from "@/components/general/connectedButtons";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  useSpellingBeeContext,
  SpellingBeeContextProvider,
} from "@/lib/contexts/spellingBeeContext";

export default function SpellingBeeLayout({ children }: { children: any }) {
  return (
    <SpellingBeeContextProvider>
      <SpellingBeeContent>{children}</SpellingBeeContent>
    </SpellingBeeContextProvider>
  );
}

function SpellingBeeContent({ children }: { children: any }) {
  const router = useRouter();
  const { updateCurrentMode } = useSpellingBeeContext() as {
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
    router.push(`/games/spelling-bee`);
    updateCurrentMode("today");
  };

  const gotoArchive = () => {
    setCurrentView("archive");
    router.push(`/games/spelling-bee/archive`);
  };

  return (
    <main className="w-9/12 max-lg:w-11/12 ml-auto mr-auto max-sm:w-11/12">
      <h1 className="font-heading text-center mb-4 text-8xl max-sm:text-7xl max-xs:text-6xl">
        Spelling Bee
      </h1>
      <ConnectedButton
        onClickLeft={gotoToday}
        onClickRight={gotoArchive}
        leftStyle="normal"
        rightStyle="normal"
        leftTitle="Todays Spelling Bee"
        rightTitle="Spelling Bee Archive"
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
