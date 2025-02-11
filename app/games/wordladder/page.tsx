"use client";

import builtListIsValid from "@/utils/games/wordladder/validateBuildList";
import ConnectedButton from "@/components/general/connectedButtons";
import Notification from "@/components/general/notification";
import { useAuthContext } from "@/lib/contexts/authContext";
import Button from "@/components/general/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export type WordLadderWord = {
  word: string;
  meaning: string;
  shown: boolean;
  solved: boolean;
};

export default function WordLadder() {
  const router = useRouter();
  const { user, isMaksim, isAdmin, isHelper } = useAuthContext() as {
    user: any;
    isMaksim: boolean;
    isAdmin: boolean;
    isHelper: boolean;
  };

  const [mode, setMode] = useState<"play" | "build">("play");
  const [buildMode, setBuildMode] = useState<"manual" | "auto">("auto");

  const [notification, setNotification] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationType, setNotificationType] = useState<
    "success" | "error" | "warning"
  >("success");
  const [notificationMessage, setNotificationMessage] = useState("");

  const [words, setWords] = useState<WordLadderWord[]>([]);
  const [buildList, setBuildList] = useState<WordLadderWord[]>([]);

  useEffect(() => {
    const list: WordLadderWord[] = [
      {
        word: "stars",
        meaning: "to shine as an actor or singer",
        shown: true,
        solved: false,
      },
      {
        word: "soars",
        meaning: "to fly at a great height",
        shown: false,
        solved: false,
      },
      {
        word: "soaks",
        meaning: "to saturate in liquid",
        shown: false,
        solved: false,
      },
      {
        word: "socks",
        meaning: "to strike forcefully",
        shown: false,
        solved: false,
      },
      {
        word: "locks",
        meaning: "to secure with a fastening device",
        shown: true,
        solved: false,
      },
    ];

    setWords(list);
  }, []);

  const createDefaultBuildList = () => {
    const list: WordLadderWord[] = [
      {
        word: "",
        meaning: "",
        shown: true,
        solved: false,
      },
      {
        word: "",
        meaning: "",
        shown: true,
        solved: false,
      },
    ];

    setBuildList(list);
  };

  const toggleMode = () => {
    if (!user) {
      triggerNotification(
        "Failed to toggle mode",
        "error",
        "You must have an account",
      );
    }

    if (!isHelper && !isAdmin && !isMaksim) {
      triggerNotification(
        "Failed to toggle mode",
        "error",
        "You must have a role",
      );
    }

    if (mode == "build") {
      setMode("play");
    } else {
      createDefaultBuildList();
      setMode("build");
    }
  };

  const toggleBuildMode = () => {
    if (!user) {
      triggerNotification(
        "Failed to toggle build mode",
        "error",
        "You must have an account",
      );
    }

    if (!isHelper && !isAdmin && !isMaksim) {
      triggerNotification(
        "Failed to toggle build mode",
        "error",
        "You must have a role",
      );
    }

    createDefaultBuildList();

    if (buildMode == "auto") {
      setBuildMode("manual");
    } else {
      setBuildMode("auto");
    }
  };

  const triggerNotification = (
    title: string,
    type: "success" | "error" | "warning",
    message: string,
    showInPlay?: boolean,
  ) => {
    if (mode == "play" && !showInPlay) return;
    setNotification(true);
    setNotificationTitle(title);
    setNotificationType(type);
    setNotificationMessage(message);
  };

  const addWord = () => {};

  const generateLadders = () => {};

  const resetLadders = () => {};

  const loadNextLadder = () => {};

  const loadPreviousLadder = () => {};

  const editWordInBuildList = (index: number, word: string) => {
    let temp: WordLadderWord[] = buildList.map((item: WordLadderWord) => ({
      ...item,
    }));

    temp[index].word = word;

    setBuildList(temp);
  };

  const editMeaningInBuildList = (index: number, meaning: string) => {
    let temp: WordLadderWord[] = buildList.map((item: WordLadderWord) => ({
      ...item,
    }));

    temp[index].meaning = meaning;

    setBuildList(temp);
  };

  const publish = () => {
    const result = builtListIsValid(buildList);

    if (result.status == "error") {
      triggerNotification(
        "Failed to validate buildList",
        "error",
        result.message,
      );

      return;
    }

    triggerNotification(
      "Saved!",
      "success",
      "Successfully updated Word Ladder",
    );
  };

  return (
    <div className="flex flex-col gap-2">
      {mode == "play" ? (
        <section className="flex flex-col w-3/4 p-3 mx-auto gap-1 text-lg justify-center rounded-lg">
          {words.map((word: WordLadderWord, i) => (
            <div
              key={i}
              className="flex justify-between items-center gap-2 p-3"
            >
              {word.shown ? (
                <p className="flex-1 text-center">{word.word}</p>
              ) : (
                <input
                  type="text"
                  className="border-b border-b-black focus:outline-none flex-1 bg-secondary-200 pl-1 rounded text-center p-3"
                />
              )}
              <p
                className={`flex-1 p-3 text-center ${word.solved ? "line-through" : ""}`}
              >
                {word.meaning}
              </p>
            </div>
          ))}
        </section>
      ) : (
        <section>
          <ConnectedButton
            onClickLeft={toggleBuildMode}
            onClickRight={toggleBuildMode}
            leftStyle="normal"
            rightStyle="normal"
            leftTitle="Automatic"
            rightTitle="Manual"
            leftClassModifier={
              buildMode == "auto"
                ? "bg-secondary-500 border-r-2 border-secondary-400"
                : "bg-secondary-400 hover:bg-secondary-500"
            }
            rightClassModifier={
              buildMode == "manual"
                ? "bg-secondary-500 border-l-2 border-secondary-400"
                : "bg-secondary-400 hover:bg-secondary-500"
            }
            containerClassModifier="w-3/4 mx-auto"
          />
          <section className="flex flex-col w-3/4 p-3 mx-auto gap-2 text-lg justify-center rounded-lg">
            <div className="flex justify-between items-center gap-2">
              <input
                type="text"
                placeholder="Starting Word"
                value={buildList[0].word}
                onChange={(e) => editWordInBuildList(0, e.target.value)}
                className="border-b border-b-black focus:outline-none flex-1 bg-secondary-200 pl-1 rounded text-center p-3 placeholder-accent-700"
              />
              <input
                type="text"
                placeholder="Meaning"
                value={buildList[0].meaning}
                onChange={(e) => editMeaningInBuildList(0, e.target.value)}
                className="border-b border-b-black focus:outline-none flex-1 bg-secondary-200 pl-1 rounded text-center p-3 placeholder-accent-700"
              />
            </div>
            {buildMode == "manual" ? (
              <Button
                onClickAction={addWord}
                title="Add Word"
                style="normal"
                classModifier="p-3"
              />
            ) : null}
            <div className="flex justify-between items-center gap-2">
              <input
                type="text"
                placeholder="Ending Word"
                value={buildList[buildList.length - 1].word}
                onChange={(e) =>
                  editWordInBuildList(buildList.length - 1, e.target.value)
                }
                className="border-b border-b-black focus:outline-none flex-1 bg-secondary-200 pl-1 rounded text-center p-3 placeholder-accent-700"
              />
              <input
                type="text"
                placeholder="Meaning"
                value={buildList[buildList.length - 1].meaning}
                onChange={(e) =>
                  editMeaningInBuildList(buildList.length - 1, e.target.value)
                }
                className="border-b border-b-black focus:outline-none flex-1 bg-secondary-200 pl-1 rounded text-center p-3 placeholder-accent-700"
              />
            </div>
            {buildMode == "auto" ? (
              <div className="flex gap-2">
                <Button
                  onClickAction={generateLadders}
                  title="Generate"
                  style="normal"
                  classModifier="p-3 flex-1"
                />
                <Button
                  onClickAction={resetLadders}
                  title="Reset"
                  style="normal"
                  classModifier="p-3 flex-1"
                />
                <Button
                  onClickAction={loadPreviousLadder}
                  title="Previous"
                  style="normal"
                  classModifier="p-3 flex-1"
                />
                <Button
                  onClickAction={loadNextLadder}
                  title="Next"
                  style="normal"
                  classModifier="p-3 flex-1"
                />
              </div>
            ) : null}
            <Button
              onClickAction={publish}
              title="Publish"
              style="normal"
              classModifier="p-3"
            />
          </section>
        </section>
      )}
      <ConnectedButton
        onClickLeft={toggleMode}
        onClickRight={toggleMode}
        leftStyle="normal"
        rightStyle="normal"
        leftTitle="Play"
        rightTitle="Build"
        leftClassModifier={
          mode == "play"
            ? "bg-secondary-500 border-r-2 border-secondary-400"
            : "bg-secondary-400 hover:bg-secondary-500"
        }
        rightClassModifier={
          mode == "build"
            ? "bg-secondary-500 border-l-2 border-secondary-400"
            : "bg-secondary-400 hover:bg-secondary-500"
        }
        containerClassModifier="w-3/4 mx-auto"
      />
      {notification ? (
        <Notification
          title={notificationTitle}
          type={notificationType}
          message={notificationMessage}
          timeout={5000}
          updateNotification={(value) => setNotification(value)}
        />
      ) : null}
    </div>
  );
}
