"use client";

import getArchivedCrosswords from "@/utils/games/crossword/getArchivedCrosswords";
import { useCrosswordContext } from "@/lib/contexts/crosswordContext";
import decodeJsonData from "@/utils/games/crossword/decodeJsonData";
import Button from "@/components/general/button";
import { useEffect, useState } from "react";
import { Crossword } from "../page";

export default function Archive() {
  const { crosswordSize, updateCurrentCrossword, updateCurrentMode } =
    useCrosswordContext() as {
      crosswordSize: { width: number; height: number; size: "mini" | "full" };
      updateCurrentCrossword: (crossword: Crossword) => void;
      updateCurrentMode: (mode: "today" | "archive") => void;
    };

  const [archivedCrosswords, setArchivedCrosswords] = useState<Crossword[]>([]);

  useEffect(() => {
    getArchivedCrosswords(crosswordSize.size).then(
      (crosswordStrings: string[] | undefined) => {
        if (crosswordStrings == undefined) {
          return;
        }

        let decodedCrosswords: Crossword[] = [];

        for (let i = 0; i < crosswordStrings.length; i++) {
          let encodedData = crosswordStrings[i];

          let decodedData = decodeJsonData(encodedData);

          decodedCrosswords.push(decodedData);
        }

        setArchivedCrosswords(decodedCrosswords);
      },
    );
  }, [crosswordSize.size]);

  const loadArchivedCrossword = (crossword: Crossword) => {
    updateCurrentCrossword(crossword);
    updateCurrentMode("archive");
  };

  return (
    <section className="grid grid-cols-3 gap-2">
      {archivedCrosswords.map((crossword: Crossword) => (
        <div
          key={crossword.published}
          className="border-t-2 border-secondary-400 hover:drop-shadow rounded-t-lg rounded-b-lg bg-accent-100 p-2 rounded-none h-56 transition-all duration-150 ease-in-out flex flex-col justify-between"
        >
          <div className="flex flex-col">
            <h2 className="font-heading text-2xl">{crossword.name}</h2>
            <p>Published: {crossword.published}</p>
            <p>By: {crossword.author}</p>
          </div>
          <Button
            title="Play"
            style="normal"
            onClick={() => loadArchivedCrossword(crossword)}
          />
        </div>
      ))}
    </section>
  );
}
