"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Crossword } from "@/app/games/crossword/page";
export const CrosswordContext = createContext({});

export const useCrosswordContext = () => useContext(CrosswordContext);

interface CrosswordContextProviderProps {
  children: ReactNode;
}

export function CrosswordContextProvider({
  children,
}: CrosswordContextProviderProps): JSX.Element {
  const [currentMode, setCurrentMode] = useState<"today" | "archive">("today");
  const [crosswordSize, setCrosswordSize] = useState<{
    width: number;
    height: number;
    size: "mini" | "full";
  }>({ width: 12, height: 12, size: "full" });

  const [currentCrossword, setCurrentCrossword] = useState<
    Crossword | undefined
  >();

  const updateSize = (size: "full" | "mini") => {
    if (size == "full") {
      setCrosswordSize({ width: 12, height: 12, size: "full" });
    } else {
      setCrosswordSize({ width: 5, height: 5, size: "mini" });
    }
  };

  const updateCurrentCrossword = (crossword: Crossword) => {
    setCurrentCrossword(crossword);
  };

  const updateCurrentMode = (mode: "today" | "archive") => {
    setCurrentMode(mode);
  };

  return (
    <CrosswordContext.Provider
      value={{
        crosswordSize,
        updateSize,
        currentCrossword,
        updateCurrentCrossword,
        currentMode,
        updateCurrentMode,
      }}
    >
      {children}
    </CrosswordContext.Provider>
  );
}
