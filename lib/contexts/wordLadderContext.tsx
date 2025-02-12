"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { WordLadderWord } from "@/app/games/wordladder/page";
export const GamesContext = createContext({});

export const useWordLadderContext = () => useContext(GamesContext);

interface GamesContextProviderProps {
  children: ReactNode;
}

export function WordLadderContextProvider({
  children,
}: GamesContextProviderProps): JSX.Element {
  const [currentMode, setCurrentMode] = useState<"today" | "archive">("today");
  const [currentWordLadder, setCurrentWordLadder] = useState<
    WordLadderWord[] | undefined
  >();

  const updateCurrentWordLadder = (wordLadder: WordLadderWord[]) => {
    setCurrentWordLadder(wordLadder);
  };

  const updateCurrentMode = (mode: "today" | "archive") => {
    setCurrentMode(mode);
  };

  return (
    <GamesContext.Provider
      value={{
        currentWordLadder,
        updateCurrentWordLadder,
        currentMode,
        updateCurrentMode,
      }}
    >
      {children}
    </GamesContext.Provider>
  );
}
