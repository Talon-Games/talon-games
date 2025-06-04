"use client";

import deleteSpellingBeeFromArchive from "@/firebase/db/games/spelling-bee/deleteSpellingBeeFromArchive";
import getArchivedSpellingBees from "@/firebase/db/games/spelling-bee/getArchivedSpellingBees";
import { useSpellingBeeContext } from "@/lib/contexts/spellingBeeContext";
import outerToBitmask from "@/utils/games/spelling-bee/outerToBitmask";
import ConnectedButton from "@/components/general/connectedButtons";
import createName from "@/utils/games/spelling-bee/createName";
import { useAuthContext } from "@/lib/contexts/authContext";
import { sendGAEvent } from "@next/third-parties/google";
import Button from "@/components/general/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SpellingBee } from "../page";

export default function SpellingBeeArchive() {
  const router = useRouter();
  const { isMaksim, isAdmin } = useAuthContext() as {
    isMaksim: boolean;
    isAdmin: boolean;
  };

  const { updateCurrentSpellingBee, updateCurrentMode } =
    useSpellingBeeContext() as {
      updateCurrentSpellingBee: (spellingBee: SpellingBee) => void;
      updateCurrentMode: (mode: "today" | "archive") => void;
    };

  const [archivedSpellingBees, setArchivedSpellingBees] = useState<
    SpellingBee[]
  >([]);
  const [confirmDeletePopup, setConfirmDeletePopup] = useState(false);
  const [spellingBeeToDelete, setSpellingBeeToDelete] = useState<
    SpellingBee | undefined
  >();

  useEffect(() => {
    getArchivedSpellingBees().then(
      (spellingBeeStrings: string[] | undefined) => {
        if (spellingBeeStrings == undefined) {
          return;
        }

        let decodedSpellingBees: SpellingBee[] = [];

        for (let i = 0; i < spellingBeeStrings.length; i++) {
          let encodedData = spellingBeeStrings[i];

          let decodedData: SpellingBee = JSON.parse(encodedData);

          decodedSpellingBees.push(decodedData);
        }

        decodedSpellingBees = decodedSpellingBees.reverse();

        setArchivedSpellingBees(decodedSpellingBees);
      },
    );
  }, []);

  const loadArchivedSpellingBee = (spellingBee: SpellingBee) => {
    updateCurrentSpellingBee(spellingBee);
    updateCurrentMode("archive");
    sendGAEvent("event", "started_archived_spelling_bee", {
      value: createName(spellingBee.center, spellingBee.outer),
    });

    router.push("/games/spelling-bee");
  };

  const triggerDeleteWorkflow = (spellingBee: SpellingBee) => {
    setSpellingBeeToDelete(spellingBee);
    setConfirmDeletePopup(true);
  };

  const deleteSpellingBee = () => {
    if (spellingBeeToDelete) {
      const spellingBeeStringToDelete = JSON.stringify(spellingBeeToDelete);

      const updatedSpellingBees = archivedSpellingBees.filter(
        (crossword) => JSON.stringify(crossword) !== spellingBeeStringToDelete,
      );

      setArchivedSpellingBees(updatedSpellingBees);

      const str =
        spellingBeeToDelete.center + spellingBeeToDelete.outer.join("");
      const idBitmask = outerToBitmask(str);
      const idFirstChar = str[0];
      const id = idFirstChar + ":" + idBitmask;

      deleteSpellingBeeFromArchive(id, spellingBeeStringToDelete).then(
        () => {},
      );
    }

    stopDeleteWorkflow();
  };

  const stopDeleteWorkflow = () => {
    setSpellingBeeToDelete(undefined);
    setConfirmDeletePopup(false);
  };

  return (
    <section className="grid grid-cols-3 gap-2 max-lg:grid-cols-2 max-sm:grid-cols-1 ">
      {archivedSpellingBees.map((spellingBee: SpellingBee, index) => (
        <div
          key={index}
          className="border-t-2 border-secondary-400 hover:drop-shadow rounded-t-lg rounded-b-lg bg-accent-100 p-2 rounded-none h-56 transition-all duration-150 ease-in-out flex flex-col justify-between"
        >
          <div className="flex flex-col">
            <h2 className="font-heading text-2xl">
              {createName(spellingBee.center, spellingBee.outer)
                .split("")
                .join(", ")}
            </h2>
            <p>Published: {spellingBee.published}</p>
            <p>By: {spellingBee.author}</p>
          </div>
          <div className="flex gap-2">
            <Button
              title="Play"
              style="normal"
              onClickAction={() => loadArchivedSpellingBee(spellingBee)}
              gaEvent={`opened-archived-spelling-bee`}
            />
            {isMaksim || isAdmin ? (
              <div
                className="flex items-center justify-center cursor-pointer bg-red-500 hover:bg-red-600 transition-all duration-200 ease-in-out p-2 rounded"
                onClick={() => triggerDeleteWorkflow(spellingBee)}
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
            <p>Are you sure you want to delete this Spelling Bee?</p>
            <ConnectedButton
              leftStyle="red"
              rightStyle="normal"
              onClickLeft={deleteSpellingBee}
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
