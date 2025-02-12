"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { WordLadderGameData } from "@/app/games/wordladder/page";
export const GamesContext = createContext({});

export const useWordLadderContext = () => useContext(GamesContext);

interface GamesContextProviderProps {
  children: ReactNode;
}

export function WordLadderContextProvider({
  children,
}: GamesContextProviderProps): JSX.Element {
  const [currentMode, setCurrentMode] = useState<"today" | "archive">("today");
  const [currentWordLadderGameData, setCurrentWordLadderGameData] = useState<
    WordLadderGameData | undefined
  >();

  const updateCurrentWordLadder = (wordLadder: WordLadderGameData) => {
    setCurrentWordLadderGameData(wordLadder);
  };

  const updateCurrentMode = (mode: "today" | "archive") => {
    setCurrentMode(mode);
  };

  return (
    <GamesContext.Provider
      value={{
        currentWordLadder: currentWordLadderGameData,
        updateCurrentWordLadder,
        currentMode,
        updateCurrentMode,
      }}
    >
      {children}
    </GamesContext.Provider>
  );
}
