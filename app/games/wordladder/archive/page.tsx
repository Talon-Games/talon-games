"use client";

import deleteWordLadderFromArchive from "@/firebase/db/games/wordladder/deleteWordLadderFromArchive";
import getArchivedWordLadders from "@/firebase/db/games/wordladder/getArchivedWordLadders";
import { useWordLadderContext } from "@/lib/contexts/wordLadderContext";
import ConnectedButton from "@/components/general/connectedButtons";
import { useAuthContext } from "@/lib/contexts/authContext";
import { sendGAEvent } from "@next/third-parties/google";
import Button from "@/components/general/button";
import { WordLadderGameData } from "../page";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function WordLadderArchive() {
  const router = useRouter();
  const { isMaksim, isAdmin } = useAuthContext() as {
    isMaksim: boolean;
    isAdmin: boolean;
  };

  const { updateCurrentWordLadder, updateCurrentMode } =
    useWordLadderContext() as {
      updateCurrentWordLadder: (wordLadder: WordLadderGameData) => void;
      updateCurrentMode: (mode: "today" | "archive") => void;
    };

  const [archivedWordLadders, setArchivedWordLadders] = useState<
    WordLadderGameData[]
  >([]);
  const [confirmDeletePopup, setConfirmDeletePopup] = useState(false);
  const [wordLadderToDelete, setWordLadderToDelete] = useState<
    WordLadderGameData | undefined
  >();

  useEffect(() => {
    getArchivedWordLadders().then((wordLadderStrings: string[] | undefined) => {
      if (wordLadderStrings == undefined) {
        return;
      }

      let decodedWordLadders: WordLadderGameData[] = [];

      for (let i = 0; i < wordLadderStrings.length; i++) {
        let encodedData = wordLadderStrings[i];

        let decodedData: WordLadderGameData = JSON.parse(encodedData);

        decodedWordLadders.push(decodedData);
      }

      decodedWordLadders = decodedWordLadders.reverse();

      setArchivedWordLadders(decodedWordLadders);
    });
  }, []);

  const loadArchivedWordLadder = (wordLadder: WordLadderGameData) => {
    updateCurrentWordLadder(wordLadder);
    updateCurrentMode("archive");
    sendGAEvent("event", "started_archived_word_ladder", {
      value: wordLadder.name,
    });

    router.push("/games/wordladder");
  };

  const triggerDeleteWorkflow = (wordLadder: WordLadderGameData) => {
    setWordLadderToDelete(wordLadder);
    setConfirmDeletePopup(true);
  };

  const deleteWordLadder = () => {
    if (wordLadderToDelete) {
      const wordLadderStringToDelete = JSON.stringify(wordLadderToDelete);

      const updatedWordLadders = archivedWordLadders.filter(
        (crossword) => JSON.stringify(crossword) !== wordLadderStringToDelete,
      );

      setArchivedWordLadders(updatedWordLadders);

      deleteWordLadderFromArchive(wordLadderStringToDelete).then(() => {});
    }

    stopDeleteWorkflow();
  };

  const stopDeleteWorkflow = () => {
    setWordLadderToDelete(undefined);
    setConfirmDeletePopup(false);
  };

  return (
    <section className="grid grid-cols-3 gap-2 max-lg:grid-cols-2 max-sm:grid-cols-1 ">
      {archivedWordLadders.map((wordLadder: WordLadderGameData, index) => (
        <div
          key={index}
          className="border-t-2 border-secondary-400 hover:drop-shadow rounded-t-lg rounded-b-lg bg-accent-100 p-2 rounded-none h-56 transition-all duration-150 ease-in-out flex flex-col justify-between"
        >
          <div className="flex flex-col">
            <h2 className="font-heading text-2xl">{wordLadder.name}</h2>
            <p>Published: {wordLadder.published}</p>
            <p>By: {wordLadder.author}</p>
          </div>
          <div className="flex gap-2">
            <Button
              title="Play"
              style="normal"
              onClickAction={() => loadArchivedWordLadder(wordLadder)}
              gaEvent={`opened-archived-word-ladder`}
            />
            {isMaksim || isAdmin ? (
              <div
                className="flex items-center justify-center cursor-pointer bg-red-500 hover:bg-red-600 transition-all duration-200 ease-in-out p-2 rounded"
                onClick={() => triggerDeleteWorkflow(wordLadder)}
              >
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
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
            <p>Are you sure you want to delete this word ladder?</p>
            <ConnectedButton
              leftStyle="red"
              rightStyle="normal"
              onClickLeft={deleteWordLadder}
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
