"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { SpellingBee } from "@/app/games/spelling-bee/page";
export const SpellingBeeContext = createContext({});

export const useSpellingBeeContext = () => useContext(SpellingBeeContext);

interface WordLadderContextProvider {
  children: ReactNode;
}

export function SpellingBeeContextProvider({
  children,
}: WordLadderContextProvider): JSX.Element {
  const [currentMode, setCurrentMode] = useState<"today" | "archive">("today");
  const [currentSpellingBee, setCurrentSpellingBee] = useState<
    SpellingBee | undefined
  >();

  const updateCurrentSpellingBee = (spellingBee: SpellingBee) => {
    setCurrentSpellingBee(spellingBee);
  };

  const updateCurrentMode = (mode: "today" | "archive") => {
    setCurrentMode(mode);
  };

  return (
    <SpellingBeeContext.Provider
      value={{
        currentSpellingBee: currentSpellingBee,
        updateCurrentSpellingBee,
        currentMode,
        updateCurrentMode,
      }}
    >
      {children}
    </SpellingBeeContext.Provider>
  );
}
