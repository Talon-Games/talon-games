"use client";

import saveWordLadder from "@/firebase/db/games/wordladder/saveWordLadder";
import WordLadderTextField from "@/components/games/wordladder/textField";
import builtListIsValid from "@/utils/games/wordladder/validateBuildList";
import ConnectedButton from "@/components/general/connectedButtons";
import Notification from "@/components/general/notification";
import { useAuthContext } from "@/lib/contexts/authContext";
import ToolTip from "@/components/general/tooltip";
import Button from "@/components/general/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import formatDate from "@/utils/formatDate";

export type WordLadderWord = {
  word: string;
  meaning: string;
  shown: boolean;
  solved: boolean;
};

export type WordLadderGameData = {
  author: string;
  name: string;
  published: string;
  wordLadder: WordLadderWord[];
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

  // The first value is always the starting word, and the second value is always the ending word
  const [wordLadder, setWordLadder] = useState<WordLadderWord[]>([]);
  const [buildWordLadder, setBuildWordLadder] = useState<WordLadderWord[]>([]);

  useEffect(() => {}, []);

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

    setBuildWordLadder(list);
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

  const addWordToBuildList = () => {
    setBuildWordLadder((prevList) => [
      ...prevList,
      {
        word: "",
        meaning: "",
        shown: false,
        solved: false,
      },
    ]);
  };

  const removeWordFromBuildList = (index: number) => {
    // Removing the starting or ending words is not allowed
    if (index === 0 || index === 1) return;

    setBuildWordLadder((prevList) => prevList.filter((_, i) => i !== index));
  };

  const generateLadders = () => {};

  const resetLadders = () => {};

  const loadNextLadder = () => {};

  const loadPreviousLadder = () => {};

  const editWordInBuildList = (index: number, word: string) => {
    setBuildWordLadder((prevList) =>
      prevList.map((item, i) => (i === index ? { ...item, word } : item)),
    );
  };

  const editMeaningInBuildList = (index: number, meaning: string) => {
    setBuildWordLadder((prevList) =>
      prevList.map((item, i) => (i === index ? { ...item, meaning } : item)),
    );
  };

  const publish = () => {
    const result = builtListIsValid(buildWordLadder);

    if (result.status == "error") {
      triggerNotification(
        "Failed to validate buildList",
        "error",
        result.message,
      );

      return;
    }

    const currentDate = new Date();
    const formattedDate = formatDate(currentDate);

    const wordLadderGameData: WordLadderGameData = {
      author: user.displayName,
      name: buildWordLadder[0].word + " to " + buildWordLadder[1].word,
      published: formattedDate,
      wordLadder: buildWordLadder,
    };

    const stringifiedGameData = JSON.stringify(wordLadderGameData);

    saveWordLadder(stringifiedGameData, true);

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
          {wordLadder.map((word: WordLadderWord, i) => (
            <div
              key={i}
              className="flex justify-between items-center gap-2 p-3"
            >
              {word.shown ? (
                <p className="flex-1 text-center">{word.word}</p>
              ) : (
                /*TODO: make this also use the component*/
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
              <WordLadderTextField
                value={buildWordLadder[0].word}
                placeholder="Starting Word"
                onChangeAction={(e) => editWordInBuildList(0, e.target.value)}
              />
              <WordLadderTextField
                value={buildWordLadder[0].meaning}
                placeholder="Meaning"
                onChangeAction={(e) =>
                  editMeaningInBuildList(0, e.target.value)
                }
              />
            </div>
            {buildWordLadder.length > 2
              ? buildWordLadder.slice(2).map((word: WordLadderWord, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center gap-2"
                  >
                    <WordLadderTextField
                      value={word.word}
                      placeholder="Word"
                      onChangeAction={(e) =>
                        editWordInBuildList(i + 2, e.target.value)
                      }
                    />
                    <WordLadderTextField
                      value={word.meaning}
                      placeholder="Meaning"
                      onChangeAction={(e) =>
                        editMeaningInBuildList(i + 2, e.target.value)
                      }
                    />
                    <ToolTip content="Remove Word" delay={20}>
                      <div
                        className="flex items-center justify-center cursor-pointer bg-red-500 hover:bg-red-600 transition-all duration-200 ease-in-out p-3 rounded"
                        onClick={() => removeWordFromBuildList(i + 2)}
                      >
                        <svg
                          width="30"
                          height="30"
                          viewBox="0 0 1920 1920"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M954.64 826.418 426.667 298.445 298.445 426.667 826.418 954.64l-527.973 527.973 128.222 128.222 527.973-527.973 527.973 527.973 128.222-128.222-527.973-527.973 527.973-527.973-128.222-128.222z" />
                        </svg>{" "}
                      </div>
                    </ToolTip>
                  </div>
                ))
              : null}
            {buildMode == "manual" ? (
              <Button
                onClickAction={addWordToBuildList}
                title="Add Word"
                style="normal"
                classModifier="p-3"
              />
            ) : null}
            <div className="flex justify-between items-center gap-2">
              <WordLadderTextField
                value={buildWordLadder[1].word}
                placeholder="Ending Word"
                onChangeAction={(e) => editWordInBuildList(1, e.target.value)}
              />
              <WordLadderTextField
                value={buildWordLadder[1].meaning}
                placeholder="Meaning"
                onChangeAction={(e) =>
                  editMeaningInBuildList(1, e.target.value)
                }
              />{" "}
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
