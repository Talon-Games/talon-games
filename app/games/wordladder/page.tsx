"use client";

import saveWordLadder from "@/firebase/db/games/wordladder/saveWordLadder";
import WordLadderTextField from "@/components/games/wordladder/textField";
import builtListIsValid from "@/utils/games/wordladder/validateBuildList";
import getWordLadder from "@/firebase/db/games/wordladder/getWordLadder";
import { useWordLadderContext } from "@/lib/contexts/wordLadderContext";
import ConnectedButton from "@/components/general/connectedButtons";
import Notification from "@/components/general/notification";
import { useAuthContext } from "@/lib/contexts/authContext";
import Stopwatch from "@/components/games/stopwatch";
import ToolTip from "@/components/general/tooltip";
import Button from "@/components/general/button";
import { useState, useEffect } from "react";
import formatTime from "@/utils/games/formatTime";
import formatDate from "@/utils/formatDate";
import isMobile from "@/utils/isMobile";
import { useRouter } from "next/navigation";

export type WordLadderWord = {
  word: string;
  meaning: string;
  value?: string;
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

  const { currentWordLadder, currentMode } = useWordLadderContext() as {
    currentWordLadder: WordLadderGameData;
    currentMode: "today" | "archive";
  };

  const [mode, setMode] = useState<"play" | "build">("play");
  const [notification, setNotification] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationType, setNotificationType] = useState<
    "success" | "error" | "warning"
  >("success");
  const [notificationMessage, setNotificationMessage] = useState("");

  // The first value in a word ladder array is always the starting word, and the second value is always the ending word
  const [wordLadder, setWordLadder] = useState<WordLadderGameData>();
  const [buildWordLadder, setBuildWordLadder] = useState<WordLadderWord[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [won, setWon] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [stoppedTime, setStoppedTime] = useState<number | null>(null);

  const [mobileDevice, setMobileDevice] = useState(false);

  const handleResetComplete = () => {
    setIsReset(false);
  };

  const handleStopTime = (time: number) => {
    setStoppedTime(time);
  };

  useEffect(() => {
    const mobile = isMobile();

    setMobileDevice(mobile);
  }, []);

  useEffect(() => {
    if (currentWordLadder == undefined || currentMode == "today") {
      getWordLadder().then((data: string) => {
        const parsed: WordLadderGameData = JSON.parse(data);
        setWordLadder(parsed);
      });
    } else {
      setWordLadder(currentWordLadder);
    }
  }, [currentWordLadder, currentMode]);

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
        true,
      );
      return;
    }

    if (!isHelper && !isAdmin && !isMaksim) {
      triggerNotification(
        "Failed to toggle mode",
        "error",
        "You must have a role",
        true,
      );
      return;
    }

    if (mode == "build") {
      setMode("play");
    } else {
      createDefaultBuildList();
      setMode("build");
    }
  };

  const triggerNotification = (
    title: string,
    type: "success" | "error" | "warning",
    message: string,
    showInPlay: boolean = false,
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

  const editWordInBuildWordLadder = (index: number, word: string) => {
    setBuildWordLadder((prevList) =>
      prevList.map((item, i) => (i === index ? { ...item, word } : item)),
    );
  };

  const editMeaningInBuildWordLadder = (index: number, meaning: string) => {
    setBuildWordLadder((prevList) =>
      prevList.map((item, i) => (i === index ? { ...item, meaning } : item)),
    );
  };

  const editWordInWordLadder = (index: number, word: string) => {
    if (revealed) {
      return;
    }

    if (!isRunning) {
      setIsRunning(true);
    }

    setWordLadder((prevList) => {
      if (!prevList) return prevList;

      if (prevList.wordLadder[index].solved) {
        return prevList;
      }

      const correctWord = prevList.wordLadder[index].word.toLowerCase();
      const isCorrect = word.toLowerCase() === correctWord;

      let newList = {
        ...prevList,
        wordLadder: prevList.wordLadder.map((item, i) =>
          i === index
            ? {
                ...item,
                value: word,
                solved: isCorrect,
              }
            : item,
        ),
      };

      let solved = true;
      for (let i = 2; i < newList.wordLadder.length; i++) {
        if (newList.wordLadder[i].solved == false) {
          solved = false;
          break;
        }
      }

      if (solved) {
        setWon(true);
        setIsRunning(false);
      }

      return newList;
    });
  };

  const reveal = () => {
    setRevealed(true);
    setIsRunning(false);

    triggerNotification(
      "Solution Revealed",
      "warning",
      "The complete solution has been revealed",
      true,
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

    saveWordLadder(stringifiedGameData, true)
      .then(() => {
        setWordLadder(wordLadderGameData);
        setMode("play");
        triggerNotification(
          "Saved!",
          "success",
          "Successfully updated Word Ladder",
          true,
        );
      })
      .catch((error) => {
        triggerNotification(
          "Save Failed",
          "error",
          "Failed to save word ladder: " + error.message,
        );
      });
  };

  const playAgain = () => {
    setIsRunning(false);
    setIsReset(true);
    setStoppedTime(null);
    setWon(false);

    setWordLadder((prevList) => {
      if (!prevList) return prevList;

      return {
        ...prevList,
        wordLadder: prevList.wordLadder.map((item) =>
          item
            ? {
                ...item,
                value: "",
                solved: false,
              }
            : item,
        ),
      };
    });
  };

  return (
    <div className="flex flex-col">
      {mode == "play" ? (
        <section className="flex flex-col w-3/4 py-3 mx-auto gap-2 text-lg justify-center rounded-lg">
          <div className="flex gap-2">
            <section className="flex gap-2 w-full">
              <Button onClickAction={reveal} title="Reveal" style="normal" />
            </section>
            <div className="rounded bg-secondary-300 p-2 max-xs:p-2 w-1/6 flex items-center justify-center">
              <Stopwatch
                start={isRunning}
                reset={isReset}
                onResetComplete={handleResetComplete}
                onStop={handleStopTime}
              />
            </div>
          </div>
          {wordLadder ? (
            <div className="rounded-lg flex flex-col gap-2">
              <div className="flex justify-between items-center gap-2 p-3">
                <p className="flex-1 text-center">
                  {wordLadder.wordLadder[0].word}
                </p>
                <p className="flex-1 text-center">
                  {wordLadder.wordLadder[0].meaning}
                </p>
              </div>
              {wordLadder.wordLadder.slice(2).map((word: WordLadderWord, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center gap-2 pl-2"
                >
                  <WordLadderTextField
                    placeholder="  Guess"
                    onChangeAction={(e) =>
                      editWordInWordLadder(i + 2, e.target.value)
                    }
                    value={`${revealed ? word.word : word.value ? word.value : ""}`}
                  />
                  <p
                    className={`flex-1 p-3 text-center ${word.solved ? "line-through" : ""}`}
                  >
                    {word.meaning}
                  </p>
                </div>
              ))}
              <div className="flex justify-between items-center gap-2 p-3">
                <p className="flex-1 text-center rounded">
                  {wordLadder.wordLadder[1].word}
                </p>
                <p className="flex-1 text-center">
                  {wordLadder.wordLadder[1].meaning}
                </p>
              </div>
            </div>
          ) : null}
        </section>
      ) : (
        <section>
          <section className="flex flex-col w-3/4 py-3 mx-auto gap-2 text-lg justify-center rounded-lg">
            <div className="flex justify-between items-center gap-2">
              <WordLadderTextField
                value={buildWordLadder[0]?.word || ""}
                placeholder="Starting Word"
                onChangeAction={(e) =>
                  editWordInBuildWordLadder(0, e.target.value)
                }
              />
              <WordLadderTextField
                value={buildWordLadder[0]?.meaning || ""}
                placeholder="Meaning"
                onChangeAction={(e) =>
                  editMeaningInBuildWordLadder(0, e.target.value)
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
                        editWordInBuildWordLadder(i + 2, e.target.value)
                      }
                    />
                    <WordLadderTextField
                      value={word.meaning}
                      placeholder="Meaning"
                      onChangeAction={(e) =>
                        editMeaningInBuildWordLadder(i + 2, e.target.value)
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
            <Button
              onClickAction={addWordToBuildList}
              title="Add Word"
              style="normal"
              classModifier="p-2"
            />
            <div className="flex justify-between items-center gap-2">
              <WordLadderTextField
                value={buildWordLadder[1]?.word || ""}
                placeholder="Ending Word"
                onChangeAction={(e) =>
                  editWordInBuildWordLadder(1, e.target.value)
                }
              />
              <WordLadderTextField
                value={buildWordLadder[1]?.meaning || ""}
                placeholder="Meaning"
                onChangeAction={(e) =>
                  editMeaningInBuildWordLadder(1, e.target.value)
                }
              />{" "}
            </div>
            <Button
              onClickAction={publish}
              title="Publish"
              style="normal"
              classModifier="p-2"
            />
          </section>
        </section>
      )}
      {wordLadder && mode == "play" ? (
        <div className="rounded justify-between bg-secondary-300 p-1 w-3/4 mx-auto mb-1 flex items-center text-sm">
          <p className="text-center px-2">{`Word Ladder by ${wordLadder.author}`}</p>
          <p className="text-center px-2">{`Published ${wordLadder.published}`}</p>
        </div>
      ) : null}
      {won ? (
        <section className="fixed flex flex-col items-center justify-center left-0 top-0 w-full h-full bg-accent-900 bg-opacity-50">
          <div className="p-10 bg-background-50 rounded-xl w-7/12 flex flex-col max-lg:w-5/6 max-sm:w-11/12">
            <h2 className="font-heading text-7xl mb-1 text-center max-md:text-6xl max-sm:text-4xl max-xs:text-3xl">
              Congratulations
            </h2>
            <h2 className="font-heading text-7xl mb-10 text-center max-md:text-6xl max-sm:text-4xl max-xs:text-3xl">
              You Won!
            </h2>
            <div className="flex gap-2 justify-center items-center max-sm:flex-col">
              <p className="text-2xl text-center">
                Completion time:{" "}
                {stoppedTime !== null
                  ? formatTime(stoppedTime)
                  : "Failed to calculate time"}
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-2 w-7/12 max-lg:w-5/6 max-sm:w-11/12">
            <Button
              onClickAction={playAgain}
              title="Play Again"
              style="normal"
              classModifier="p-5"
              gaEvent={`word-ladder-play-again`}
            />
            <Button
              onClickAction={() => router.push("/")}
              title="Browse Games"
              style="normal"
              classModifier="p-5"
            />
          </div>
        </section>
      ) : null}
      {!mobileDevice ? (
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
      ) : null}
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
