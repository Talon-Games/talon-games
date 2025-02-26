"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { WordLadderGameData } from "@/app/games/wordladder/page";
export const WordLadderContext = createContext({});

export const useWordLadderContext = () => useContext(WordLadderContext);

interface WordLadderContextProvider {
  children: ReactNode;
}

export function WordLadderContextProvider({
  children,
}: WordLadderContextProvider): JSX.Element {
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
    <WordLadderContext.Provider
      value={{
        currentWordLadder: currentWordLadderGameData,
        updateCurrentWordLadder,
        currentMode,
        updateCurrentMode,
      }}
    >
      {children}
    </WordLadderContext.Provider>
  );
}
