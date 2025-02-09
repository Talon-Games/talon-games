"use client";

import deleteCrosswordFromArchive from "@/firebase/db/games/crossword/deleteCrosswordFromArchive";
import getArchivedCrosswords from "@/utils/games/crossword/getArchivedCrosswords";
import decodeJsonData from "@/utils/games/crossword/decodeJsonData";
import ConnectedButton from "@/components/general/connectedButtons";
import { useGamesContext } from "@/lib/contexts/gamesContext";
import { useAuthContext } from "@/lib/contexts/authContext";
import Button from "@/components/general/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Crossword } from "../page";

export default function Archive() {
  const router = useRouter();
  const { isMaksim, isAdmin } = useAuthContext() as {
    isMaksim: boolean;
    isAdmin: boolean;
  };

  const { crosswordSize, updateCurrentCrossword, updateCurrentMode } =
    useGamesContext() as {
      crosswordSize: { width: number; height: number; size: "mini" | "full" };
      updateCurrentCrossword: (crossword: Crossword) => void;
      updateCurrentMode: (mode: "today" | "archive") => void;
    };
  const [archivedCrosswords, setArchivedCrosswords] = useState<Crossword[]>([]);
  const [confirmDeletePopup, setConfirmDeletePopup] = useState(false);
  const [crosswordToDelete, setCrosswordToDelete] = useState<
    Crossword | undefined
  >();

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

        decodedCrosswords = decodedCrosswords.reverse();

        setArchivedCrosswords(decodedCrosswords);
      },
    );
  }, [crosswordSize.size]);

  const loadArchivedCrossword = (crossword: Crossword) => {
    updateCurrentCrossword(crossword);
    updateCurrentMode("archive");
    router.push(`/games/crossword/?type=${crosswordSize.size}`);
  };

  const triggerDeleteWorkflow = (crossword: Crossword) => {
    setCrosswordToDelete(crossword);
    setConfirmDeletePopup(true);
  };

  const deleteCrossword = () => {
    if (crosswordToDelete) {
      const crosswordStringToDelete = JSON.stringify(crosswordToDelete);

      const updatedCrosswords = archivedCrosswords.filter(
        (crossword) => JSON.stringify(crossword) !== crosswordStringToDelete,
      );

      setArchivedCrosswords(updatedCrosswords);

      deleteCrosswordFromArchive(
        crosswordStringToDelete,
        crosswordSize.size,
      ).then(() => {});
    }

    stopDeleteWorkflow();
  };

  const stopDeleteWorkflow = () => {
    setCrosswordToDelete(undefined);
    setConfirmDeletePopup(false);
  };

  return (
    <section className="grid grid-cols-3 gap-2 max-lg:grid-cols-2 max-sm:grid-cols-1 ">
      {archivedCrosswords.map((crossword: Crossword, index) => (
        <div
          key={index}
          className="border-t-2 border-secondary-400 hover:drop-shadow rounded-t-lg rounded-b-lg bg-accent-100 p-2 rounded-none h-56 transition-all duration-150 ease-in-out flex flex-col justify-between"
        >
          <div className="flex flex-col">
            <h2 className="font-heading text-2xl">{crossword.name}</h2>
            <p>Published: {crossword.published}</p>
            <p>By: {crossword.author}</p>
          </div>
          <div className="flex gap-2">
            <Button
              title="Play"
              style="normal"
              onClickAction={() => loadArchivedCrossword(crossword)}
              gaEvent={`opened-archived-${crosswordSize.size}-crossword`}
            />
            {isMaksim || isAdmin ? (
              <div
                className="flex items-center justify-center cursor-pointer bg-red-500 hover:bg-red-600 transition-all duration-200 ease-in-out p-2 rounded"
                onClick={() => triggerDeleteWorkflow(crossword)}
              >
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M5.5 1a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1zM3 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1H11v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4h-.5a.5.5 0 0 1-.5-.5M5 4h5v8H5z"
                    fill="#000"
                  />
                </svg>{" "}
              </div>
            ) : null}
          </div>
        </div>
      ))}
      {confirmDeletePopup ? (
        <section className="fixed flex items-center justify-center left-0 top-0 w-full h-full bg-accent-900 bg-opacity-50">
          <div className="p-10 bg-background-50 rounded-xl">
            <p>Are you sure you want to delete this crossword?</p>
            <ConnectedButton
              leftStyle="red"
              rightStyle="normal"
              onClickLeft={deleteCrossword}
              onClickRight={stopDeleteWorkflow}
              leftTitle="Yes"
              rightTitle="No"
            />
          </div>
        </section>
      ) : null}
    </section>
  );
}
