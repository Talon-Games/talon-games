"use client";

import ConnectedButton from "@/components/general/connectedButtons";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CrosswordLayout({ children }: { children: any }) {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<"today" | "archive">("today");
  const url = new URL(window.location.href);

  useEffect(() => {
    if (url.toString().includes("archive")) {
      setCurrentView("archive");
    } else {
      setCurrentView("today");
    }
  }, []);

  const gotoToday = () => {
    setCurrentView("today");
    router.push(`/games/wordsearch`);
  };

  const gotoArchive = () => {
    setCurrentView("archive");
    router.push(`/games/wordsearch/archive`);
  };

  return (
    <main className="w-9/12 ml-auto mr-auto max-sm:w-11/12">
      <h1 className="font-heading text-center mb-4 text-8xl max-sm:text-7xl max-xs:text-6xl">
        Word Search
      </h1>
      <ConnectedButton
        onClickLeft={gotoToday}
        onClickRight={gotoArchive}
        leftStyle="normal"
        rightStyle="normal"
        leftTitle="Todays Word Search"
        rightTitle="Word Search Archive"
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
