"use client";

import { createContext, useContext, useState, ReactNode } from "react";
export const CrosswordContext = createContext({});

export const useCrosswordContext = () => useContext(CrosswordContext);

interface CrosswordContextProviderProps {
  children: ReactNode;
}

export function CrosswordContextProvider({
  children,
}: CrosswordContextProviderProps): JSX.Element {
  const [crosswordSize, setCrosswordSize] = useState<{
    width: number;
    height: number;
    size: "mini" | "full";
  }>({ width: 12, height: 12, size: "full" });

  const updateSize = (size: "full" | "mini") => {
    if (size == "full") {
      setCrosswordSize({ width: 12, height: 12, size: "full" });
    } else {
      setCrosswordSize({ width: 5, height: 5, size: "mini" });
    }
  };

  return (
    <CrosswordContext.Provider value={{ crosswordSize, updateSize }}>
      {children}
    </CrosswordContext.Provider>
  );
}
