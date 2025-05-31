"use client";

//TODO: only save progress for current bee, if user plays from archive dont update, check against date

/*
Beginner: 0%
Good Start: 2%
Moving Up: 5%
Good: 8%
Solid: 15%
Nice: 25%
Great: 40%
Amazing: 50%
Genius: 70%
*/

import calculatePointsForGuess from "@/utils/games/spelling-bee/calculatePointsForGuess";
import FoundWordsContainer from "@/components/games/spelling-bee/foundWordsContainer";
import isValidGuess from "@/utils/games/spelling-bee/isValidGuess";
import isPangram from "@/utils/games/spelling-bee/isPangram";
import Hive from "@/components/games/spelling-bee/hive";
import Button from "@/components/general/button";
import { useState, useEffect } from "react";

export type SpellingBee = {
  center: string;
  outer: string[];
  answers: string[];
  maxPoints: number;
  realAuthor: string; // google user whos account was used author: string; // the person given credit
  author: string;
  published: string;
};

export default function SpellingBee() {
  const [currentSpellingBee, setCurrentSpellingBee] = useState<SpellingBee>();
  const [currentGuess, setCurrentGuess] = useState<string>("-");
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [pangramsThisGame, setPangramsThisGame] = useState<number>(0);

  useEffect(() => {
    const thing: SpellingBee = {
      center: "i",
      outer: ["b", "e", "g", "n", "s", "l"],
      answers: ["beginnings", "signless", "illegiblenesses"],
      maxPoints: 0,
      realAuthor: "",
      author: "",
      published: "",
    };

    setCurrentSpellingBee(thing);

    window.addEventListener("beforeunload", () => updateDB());
    return () => window.removeEventListener("beforeunload", () => updateDB());
  }, []);

  function updateDB() {
    console.log("TODO");
    //TODO: update with guessed words only, compute points and what not later,
    //Keep track of high score, and longest word, and most words, and pangrams found, and solves
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!currentSpellingBee) return;

      const { center, outer } = currentSpellingBee;
      const key = e.key.toLowerCase();

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
  }, [currentSpellingBee, currentGuess]);

  function deleteFromGuess() {
    if (currentGuess.length > 1) {
      setCurrentGuess(currentGuess.slice(0, -1));
    } else {
      setCurrentGuess("-");
    }
  }

  function hexPressed(letter: string) {
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
    const result = isValidGuess(currentSpellingBee, currentGuess);

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
    setPoints(points + pointsEarned);
    setFoundWords([...foundWords, currentGuess]);
    updateDB();
    setCurrentGuess("-");
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
        <FoundWordsContainer
          spellingBee={currentSpellingBee}
          foundWords={foundWords}
        />
      </div>
    </main>
  );
}
