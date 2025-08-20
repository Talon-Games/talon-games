"use client";

import getCreatedSpellingBees from "@/firebase/db/games/spelling-bee/getCreatedSpellingBees";
import calculatePointsForGuess from "@/utils/games/spelling-bee/calculatePointsForGuess";
import FoundWordsContainer from "@/components/games/spelling-bee/foundWordsContainer";
import calculateMaxPoints from "@/utils/games/spelling-bee/calculateMaxPoints";
import saveSpellingBee from "@/firebase/db/games/spelling-bee/saveSpellingBee";
import getSpellingBee from "@/firebase/db/games/spelling-bee/getSpellingBee";
import calculateCutOffs from "@/utils/games/spelling-bee/calculateCutOffs";
import { useSpellingBeeContext } from "@/lib/contexts/spellingBeeContext";
import RankingModal from "@/components/games/spelling-bee/rankingModal";
import outerToBitmask from "@/utils/games/spelling-bee/outerToBitmask";
import ConnectedButton from "@/components/general/connectedButtons";
import RankingBar from "@/components/games/spelling-bee/rankingBar";
import isValidGuess from "@/utils/games/spelling-bee/isValidGuess";
import Notification from "@/components/general/notification";
import loadWords from "@/utils/games/spelling-bee/loadWords";
import isPangram from "@/utils/games/spelling-bee/isPangram";
import { useAuthContext } from "@/lib/contexts/authContext";
import { Word } from "@/utils/games/spelling-bee/loadWords";
import Hive from "@/components/games/spelling-bee/hive";
import TextInput from "@/components/general/TextInput";
import Button from "@/components/general/button";
import { useRouter } from "next/navigation";
import formatDate from "@/utils/formatDate";
import { useState, useEffect } from "react";

export type SpellingBee = {
  center: string;
  outer: string[];
  answers: string[];
  author: string;
  published: string;
};

export type CutOffs = {
  beginner: number; // 0%
  goodStart: number; // 2%
  movingUp: number; // 5%
  good: number; // 8%
  solid: number; // 15%
  nice: number; // 25%
  great: number; // 40%
  amazing: number; // 50%
  genius: number; // 70%
};

export default function SpellingBee() {
  const router = useRouter();
  const { user, isMaksim, isAdmin, isHelper } = useAuthContext() as {
    user: any;
    isMaksim: boolean;
    isAdmin: boolean;
    isHelper: boolean;
  };

  const { currentSpellingBee, currentMode } = useSpellingBeeContext() as {
    currentSpellingBee: SpellingBee;
    currentMode: "today" | "archive";
  };

  const [mode, setMode] = useState<"play" | "build">("play");
  const [notification, setNotification] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationType, setNotificationType] = useState<
    "success" | "error" | "warning"
  >("success");
  const [notificationMessage, setNotificationMessage] = useState("");

  const [alreadyUsedBees, setAlreadUsedBees] = useState<string[]>([]);
  const [buildWordOptions, setBuildWordOptions] = useState<Word[]>([]);
  const [buildCenterLetter, setBuildCenterLetter] = useState("");
  const [buildOuterLetters, setBuildOuterLetters] = useState<string[]>([]);
  const [buildValidWords, setBuildValidWords] = useState<Word[]>([]);
  const [buildSelectedWords, setBuildSelectedWords] = useState<string[]>([]);

  const [loadedSpellingBee, setLoadedSpellingBee] = useState<SpellingBee>();
  const [cutOffs, setCutOffs] = useState<CutOffs>();
  const [currentGuess, setCurrentGuess] = useState<string>("-");
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [points, setPoints] = useState<number>(0);

  const [cutOffModal, setCutOffModal] = useState<boolean>(false);

  const [won, setWon] = useState<boolean>(false);
  const [winModal, setWinModal] = useState<boolean>(false);

  useEffect(() => {
    if (currentSpellingBee == undefined || currentMode == "today") {
      getSpellingBee().then((data: string) => {
        const parsed: SpellingBee = JSON.parse(data);
        const maxPoints = calculateMaxPoints(parsed.answers);
        setCutOffs(calculateCutOffs(maxPoints));
        setLoadedSpellingBee(parsed);
      });
    } else {
      const maxPoints = calculateMaxPoints(currentSpellingBee.answers);
      setCutOffs(calculateCutOffs(maxPoints));
      setLoadedSpellingBee(currentSpellingBee);
    }
  }, [currentSpellingBee, currentMode]);

  function toggleMode() {
    if (!user) {
      triggerNotification(
        "Failed to toggle mode",
        "error",
        "You must have an account",
      );
      return;
    }

    if (!isHelper && !isAdmin && !isMaksim) {
      triggerNotification(
        "Failed to toggle mode",
        "error",
        "You must have a role",
      );
      return;
    }

    if (mode == "build") {
      setMode("play");
    } else {
      setMode("build");
    }
  }

  function triggerNotification(
    title: string,
    type: "success" | "error" | "warning",
    message: string,
  ) {
    setNotification(true);
    setNotificationTitle(title);
    setNotificationType(type);
    setNotificationMessage(message);
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!loadedSpellingBee || won) return;

      const { center, outer } = loadedSpellingBee;
      const key = e.key.toLowerCase();

      if (key === "escape") {
        e.preventDefault();
        setCutOffModal(false);
        setWinModal(false);
        return;
      }

      if (mode == "build" || winModal || cutOffModal) return;

      if (key === "enter") {
        e.preventDefault();
        handleGuess();
        return;
      }

      if (key === "backspace" || key === "delete") {
        e.preventDefault();
        deleteFromGuess();
        return;
      }

      // Ignore non-letter keys
      if (!/^[a-z]$/.test(key)) return;

      // Only allow center or outer letters
      if (key === center || outer.includes(key)) {
        e.preventDefault();
        hexPressed(key);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [loadedSpellingBee, currentGuess, mode, winModal, cutOffModal]);

  function reset() {
    setLoadedSpellingBee(undefined);
    setCutOffs(undefined);
    setPoints(0);
  }

  function deleteFromGuess() {
    if (currentGuess.length > 1) {
      setCurrentGuess(currentGuess.slice(0, -1));
    } else {
      setCurrentGuess("-");
    }
  }

  function hexPressed(letter: string) {
    if (won) return;

    if (currentGuess == "-") {
      setCurrentGuess(letter);
      return;
    }

    setCurrentGuess(currentGuess + letter);

    if ((currentGuess + letter).length >= 20) {
      console.error("Too long!");
      setCurrentGuess("-");
      return;
    }
  }

  function handleGuess() {
    if (!cutOffs || won) return;
    if (!loadedSpellingBee) return;
    const result = isValidGuess(loadedSpellingBee, currentGuess, foundWords);

    if (!result.ok) {
      console.log(result.error);
      setCurrentGuess("-");
      return;
    }

    let pointsEarned = calculatePointsForGuess(currentGuess);
    const pangram = isPangram(
      loadedSpellingBee.center,
      loadedSpellingBee.outer,
      currentGuess,
    );
    if (pangram) {
      pointsEarned += 7;
    }
    setFoundWords([...foundWords, currentGuess]);

    setCurrentGuess("-");
    if (points + pointsEarned >= cutOffs.genius) {
      setWon(true);
      setWinModal(true);
    }
    setPoints(points + pointsEarned);
  }

  function shuffleOuter() {
    if (!loadedSpellingBee) return;

    let newArr = [...loadedSpellingBee.outer];

    for (let i = newArr.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }

    setLoadedSpellingBee({
      ...loadedSpellingBee,
      outer: newArr,
    });
  }

  function updateCenterLetter(event: any) {
    const value = event.target.value;

    const letter = value.charAt(value.length - 1);

    if (buildOuterLetters.includes(letter)) {
      triggerNotification("Error", "error", "Center letter in outer letters!");
      return;
    }

    if (value.length > 1) {
      setBuildCenterLetter(letter);
    } else {
      setBuildCenterLetter(letter);
    }
  }

  function updateOuterLetters(event: any) {
    const value: string = event.target.value;

    const letters = value.replaceAll(", ", "");
    const newLetter = letters.charAt(letters.length - 1);

    if (letters.length < buildOuterLetters.length) {
      setBuildOuterLetters(letters.split(""));
      return;
    }

    if (buildOuterLetters.includes(newLetter)) {
      triggerNotification("Error", "error", "Outer letter in outer letters!");
      return;
    }

    if (newLetter == buildCenterLetter) {
      triggerNotification("Error", "error", "Outer letter is center letter!");
      return;
    }
    if (letters.length > 6) return;

    setBuildOuterLetters(letters.split(""));
  }

  async function findWords() {
    if (buildCenterLetter == "" || buildOuterLetters.length != 6) return;

    let created: string[];
    if (alreadyUsedBees.length == 0) {
      let temp = await getCreatedSpellingBees();
      if (temp == undefined) {
        triggerNotification(
          "Failed to find words",
          "error",
          "Failed to load already created bees",
        );
        return;
      }
      setAlreadUsedBees(temp);
      created = temp;
    } else {
      created = alreadyUsedBees;
    }

    const str = buildCenterLetter + buildOuterLetters.join("");
    const idBitmask = outerToBitmask(str);
    const idFirstChar = str[0];
    const id = idFirstChar + ":" + idBitmask;

    if (created.includes(id)) {
      triggerNotification(
        "Canceled word find",
        "warning",
        "A spelling bee with these letters already exists",
      );
      return;
    }

    let words: Word[] = [];
    if (buildWordOptions.length == 0) {
      words = await loadWords();
      setBuildWordOptions(words);
    } else {
      words = buildWordOptions;
    }

    let validWords: Word[] = [];

    words.forEach((word: Word) => {
      if (!word.word.includes(buildCenterLetter)) return;
      let valid = true;
      word.word.split("").forEach((letter: string) => {
        if (letter == buildCenterLetter || !valid) return;
        if (!buildOuterLetters.includes(letter)) {
          valid = false;
          return;
        }
      });

      if (valid) {
        validWords.push(word);
      }
    });

    validWords = validWords
      .sort((a: Word, b: Word) => {
        if (a.word.length === b.word.length) {
          return a.word.localeCompare(b.word);
        }
        return a.word.length - b.word.length;
      })
      .reverse();

    setBuildValidWords(validWords);
  }

  function toggleSelectedWord(word: string) {
    if (buildSelectedWords.includes(word)) {
      const words = buildSelectedWords.filter((a: string) => a !== word);
      setBuildSelectedWords(words);
    } else {
      setBuildSelectedWords([...buildSelectedWords, word]);
    }
  }

  function publish() {
    if (!(isMaksim || isAdmin || isHelper)) {
      triggerNotification(
        "Not enough permission",
        "error",
        "You cant publish a Spelling Bee",
      );
      return;
    }

    if (buildCenterLetter.length != 1) {
      triggerNotification(
        "No center letter",
        "error",
        "Please enter a center letter",
      );
      return;
    }

    if (buildOuterLetters.length != 6) {
      triggerNotification(
        "Not enough outer letter",
        "error",
        "Please enter 6 outer letters",
      );
      return;
    }

    if (buildSelectedWords.length == 0) {
      triggerNotification(
        "No selected words",
        "error",
        "Please selected words to include",
      );
      return;
    }

    const currentDate = new Date();
    const formattedDate = formatDate(currentDate);

    const bee = {
      center: buildCenterLetter,
      outer: buildOuterLetters,
      answers: buildSelectedWords,
      author: user.displayName,
      published: formattedDate,
    };

    const stringifiedGameData = JSON.stringify(bee);

    const str = buildCenterLetter + buildOuterLetters.join("");
    const idBitmask = outerToBitmask(str);
    const idFirstChar = str[0];

    const id = idFirstChar + ":" + idBitmask;

    saveSpellingBee(id, stringifiedGameData)
      .then(() => {
        const maxPoints = calculateMaxPoints(bee.answers);
        reset();
        setCutOffs(calculateCutOffs(maxPoints));
        setLoadedSpellingBee(bee);
        setMode("play");
        triggerNotification(
          "Saved!",
          "success",
          "Successfully published Spelling Bee",
        );
      })
      .catch((error) => {
        triggerNotification(
          "Save Failed",
          "error",
          "Failed to publish spelling bee: " + error.message,
        );
      });
  }

  return (
    <>
      {mode == "play" ? (
        <div className="flex gap-2 items-center justify-center mt-10">
          <section className="flex flex-col justify-center items-center  w-1/2">
            {loadedSpellingBee && (
              <div
                className={`uppercase flex p-5 -mb-20 text-2xl font-semibold ${currentGuess == "-" ? "text-white/0" : ""}`}
              >
                {currentGuess.split("").map((letter: string, key: number) => (
                  <p
                    key={key}
                    className={
                      letter == loadedSpellingBee.center
                        ? "text-secondary-400"
                        : ""
                    }
                  >
                    {letter}
                  </p>
                ))}
              </div>
            )}
            {loadedSpellingBee && (
              <Hive
                center={loadedSpellingBee.center}
                outer={loadedSpellingBee.outer}
                hexPressed={hexPressed}
              />
            )}
            <div className="flex gap-2 pt-20 w-1/2">
              <Button
                title="Delete"
                style="red"
                onClickAction={deleteFromGuess}
                classModifier="z-10"
              />
              <Button
                title="Shuffle"
                style="normal"
                onClickAction={shuffleOuter}
                classModifier="z-10"
              />
              <Button
                title="Enter"
                style="green"
                onClickAction={handleGuess}
                classModifier="z-10"
              />
            </div>
          </section>
          <section className="w-5/12 flex flex-col gap-2">
            {cutOffs && (
              <RankingBar
                cutOffs={cutOffs}
                points={points}
                toggleModal={() => setCutOffModal(!cutOffModal)}
              />
            )}
            <FoundWordsContainer
              spellingBee={loadedSpellingBee}
              foundWords={foundWords}
            />
          </section>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <div>
              <p>Center Letter</p>
              <TextInput
                value={buildCenterLetter}
                placeholder="Center Letter"
                onChangeAction={updateCenterLetter}
                classModifier="w-full"
              />
            </div>
            <div className="w-full">
              <p>Outer Letters</p>
              <TextInput
                value={buildOuterLetters.join(", ")}
                placeholder="Outer Letters"
                onChangeAction={updateOuterLetters}
                classModifier="w-full"
              />
            </div>
          </div>
          <Button
            title="Find Words"
            disabled={
              buildOuterLetters.length != 6 || buildCenterLetter.length != 1
            }
            onClickAction={findWords}
            style="normal"
          />
          <div className="flex justify-between">
            <p>{`${buildSelectedWords.length}/${buildValidWords.length} Selected`}</p>
            <div className="flex gap-2">
              <p>{`Total Points: ${calculateMaxPoints(buildSelectedWords) || 0}`}</p>
              <p>{`Genius Points: ${Math.ceil(calculateMaxPoints(buildSelectedWords) * 0.7) || 0}`}</p>
            </div>
          </div>
          <div className="flex flex-col">
            {buildValidWords.map((word: Word, key: number) => (
              <div
                key={key}
                className={`flex items-center justify-between gap-2 px-2 ${key % 2 == 0 ? "bg-gray-100 hover:bg-gray-200" : "bg-secondary-50 hover:bg-secondary-100"} cursor-pointer duration-200 transition-all ease-in-out`}
                onClick={() => toggleSelectedWord(word.word)}
              >
                <p
                  className={`${buildSelectedWords.includes(word.word) ? "font-semibold" : null} font-mono`}
                >
                  {word.word}
                  {isPangram(buildCenterLetter, buildOuterLetters, word.word)
                    ? "*"
                    : null}
                </p>
                <p className="text-right">{word.meaning}</p>
              </div>
            ))}
          </div>
          <Button title="Publish" onClickAction={publish} style="normal" />
        </div>
      )}
      {user && (isMaksim || isAdmin || isHelper) ? (
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
          containerClassModifier="w-11/12 mx-auto max-lg:w-full mt-2"
        />
      ) : null}
      {cutOffModal && cutOffs && (
        <RankingModal
          cutOffs={cutOffs}
          points={points}
          toggleModal={() => setCutOffModal(!cutOffModal)}
        />
      )}
      {winModal && (
        <section
          className="fixed flex flex-col items-center justify-center left-0 top-0 w-full h-full bg-accent-900 bg-opacity-50 z-20"
          onClick={() => setWinModal(!winModal)}
        >
          <div
            className="p-10 bg-background-50 rounded-xl w-7/12 flex flex-col max-lg:w-5/6 max-sm:w-11/12"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="font-heading text-7xl mb-1 text-center max-md:text-6xl max-sm:text-4xl max-xs:text-3xl">
              Congratulations
            </h2>
            <h2 className="font-heading text-7xl mb-10 text-center max-md:text-6xl max-sm:text-4xl max-xs:text-3xl">
              You Won!
            </h2>
          </div>
          <div className="flex gap-2 mt-2 w-7/12 max-lg:w-5/6 max-sm:w-11/12">
            <Button
              onClickAction={() => setWinModal(!winModal)}
              title="View Puzzle"
              style="normal"
              classModifier="p-5"
            />
            <Button
              onClickAction={() => router.push("/")}
              title="Browse Games"
              style="normal"
              classModifier="p-5"
            />
          </div>
        </section>
      )}
      {notification ? (
        <Notification
          title={notificationTitle}
          type={notificationType}
          message={notificationMessage}
          timeout={5000}
          updateNotification={(value) => setNotification(value)}
        />
      ) : null}
    </>
  );
}
