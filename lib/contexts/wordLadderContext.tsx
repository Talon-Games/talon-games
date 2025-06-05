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
  const [currentWordLadder, setCurrentWordLadder] = useState<
    WordLadderGameData | undefined
  >();

  function updateCurrentWordLadder(wordLadder: WordLadderGameData) {
    setCurrentWordLadder(wordLadder);
  }

  function updateCurrentMode(mode: "today" | "archive") {
    setCurrentMode(mode);
  }

  return (
    <WordLadderContext.Provider
      value={{
        currentWordLadder: currentWordLadder,
        updateCurrentWordLadder,
        currentMode,
        updateCurrentMode,
      }}
    >
      {children}
    </WordLadderContext.Provider>
  );
}
