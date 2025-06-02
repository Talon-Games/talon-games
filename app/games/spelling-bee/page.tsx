"use client";

//TODO: only save progress for current bee, if user plays from archive dont update, check against date

import calculatePointsForGuess from "@/utils/games/spelling-bee/calculatePointsForGuess";
import FoundWordsContainer from "@/components/games/spelling-bee/foundWordsContainer";
import calculateMaxPoints from "@/utils/games/spelling-bee/calculateMaxPoints";
import calculateCutOffs from "@/utils/games/spelling-bee/calculateCutOffs";
import RankingModal from "@/components/games/spelling-bee/rankingModal";
import RankingBar from "@/components/games/spelling-bee/rankingBar";
import isValidGuess from "@/utils/games/spelling-bee/isValidGuess";
import isPangram from "@/utils/games/spelling-bee/isPangram";
import { useAuthContext } from "@/lib/contexts/authContext";
import Hive from "@/components/games/spelling-bee/hive";
import Button from "@/components/general/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export type SpellingBee = {
  center: string;
  outer: string[];
  answers: string[];
  maxPoints: number;
  realAuthor: string; // google user whos account was used author: string; // the person given credit
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

  const [currentSpellingBee, setCurrentSpellingBee] = useState<SpellingBee>();
  const [cutOffs, setCutOffs] = useState<CutOffs>();
  const [currentGuess, setCurrentGuess] = useState<string>("-");
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [pangramsThisGame, setPangramsThisGame] = useState<number>(0);

  const [cutOffModal, setCutOffModal] = useState<boolean>(false);

  const [won, setWon] = useState<boolean>(false);
  const [winModal, setWinModal] = useState<boolean>(false);

  useEffect(() => {
    const thing: SpellingBee = {
      center: "l",
      outer: ["b", "e", "v", "a", "o", "y"],
      answers: [
        "volleyball",
        "labellable",
        "labelable",
        "evolvable",
        "obeyable",
        "loveably",
        "loveable",
        "eyelevel",
        "loyally",
        "lovably",
        "lovable",
        "levelly",
        "eyeball",
        "bellboy",
        "ballboy",
        "volley",
        "valley",
        "lovely",
        "evolve",
        "bobbly",
        "bobble",
        "blobby",
        "blabby",
        "babble",
        "allele",
        "valve",
        "loyal",
        "lovey",
        "lobby",
        "loave",
        "level",
        "leave",
        "label",
        "bevel",
        "belly",
        "belle",
        "belay",
        "alloy",
        "alley",
        "yell",
        "veal",
        "vale",
        "oval",
        "olla",
        "love",
        "lobe",
        "leve",
        "lava",
        "eely",
        "blob",
        "blab",
        "bell",
        "ally",
        "ably",
        "able",
      ],
      maxPoints: 0,
      realAuthor: "",
      author: "",
      published: "",
    };

    const cuts = calculateCutOffs(calculateMaxPoints(thing.answers));
    setCutOffs(cuts);

    setCurrentSpellingBee(thing);

    window.addEventListener("beforeunload", () => updateDB());
    return () => window.removeEventListener("beforeunload", () => updateDB());
  }, []);

  function updateDB() {
    console.log("TODO");
    //TODO: update with guessed words only
    //Keep track of high score, and longest word, and most words, and pangrams found, and solves
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!currentSpellingBee || won) return;

      const { center, outer } = currentSpellingBee;
      const key = e.key.toLowerCase();

      if (key === "enter") {
        e.preventDefault();
        handleGuess();
        return;
      }

      if (key === "escape") {
        e.preventDefault();
        setCutOffModal(false);
        setWinModal(false);
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
  }, [currentSpellingBee, currentGuess]);

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
    const result = isValidGuess(currentSpellingBee, currentGuess, foundWords);

    if (!result.ok) {
      console.log(result.error);
      setCurrentGuess("-");
      return;
    }

    let pointsEarned = calculatePointsForGuess(currentGuess);
    const pangram = isPangram(currentSpellingBee, currentGuess);
    if (pangram) {
      setPangramsThisGame(pangramsThisGame + 1);
      pointsEarned += 7;
    }
    setFoundWords([...foundWords, currentGuess]);
    updateDB();
    setCurrentGuess("-");
    if (points + pointsEarned >= cutOffs.genius) {
      setWon(true);
      setWinModal(true);
    }
    setPoints(points + pointsEarned);
  }

  function shuffleOuter() {
    if (!currentSpellingBee) return;

    let newArr = [...currentSpellingBee.outer];

    for (let i = newArr.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }

    setCurrentSpellingBee({
      ...currentSpellingBee,
      outer: newArr,
    });
  }

  return (
    <main className="w-9/12 ml-auto mr-auto max-sm:w-11/12">
      <>
        <h1 className="font-heading text-center mb-4 text-8xl max-sm:text-7xl max-xs:text-6xl">
          Spelling Bee
        </h1>
        <div className="flex gap-2 items-center justify-center mt-10">
          <section className="flex flex-col justify-center items-center  w-1/2">
            {currentSpellingBee && (
              <div
                className={`uppercase flex p-5 -mb-20 text-2xl font-semibold ${currentGuess == "-" ? "text-white/0" : ""}`}
              >
                {currentGuess.split("").map((letter: string, key: number) => (
                  <p
                    key={key}
                    className={
                      letter == currentSpellingBee.center
                        ? "text-secondary-400"
                        : ""
                    }
                  >
                    {letter}
                  </p>
                ))}
              </div>
            )}
            {currentSpellingBee && (
              <Hive
                center={currentSpellingBee.center}
                outer={currentSpellingBee.outer}
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
              spellingBee={currentSpellingBee}
              foundWords={foundWords}
            />
          </section>
        </div>
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
      </>
    </main>
  );
}
