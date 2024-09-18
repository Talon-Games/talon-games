"use client";

import { useCrosswordContext } from "@/lib/contexts/crosswordContext";

export default function Archive() {
  const { crosswordSize } = useCrosswordContext() as {
    crosswordSize: { width: number; height: number; size: "mini" | "full" };
    updateSize: (size: "mini" | "full") => void;
  };

  return <section>{crosswordSize.size}</section>;
}
