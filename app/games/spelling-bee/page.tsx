"use client";

//TODO: only save progress for current bee, if user plays from archive dont update, check against date

import Hive from "@/components/games/spelling-bee/hive";
import { ok, err, Result } from "@/utils/errors";
import { useState, useEffect } from "react";

export type SpellingBee = {
  center: string;
  outer: string[];
  answers: string[];
  maxPoints: number;
  realAuthor: string; // google user whos account was used
  author: string; // the person given credit
  published: string;
};

export default function SpellingBee() {
  const [currentSpellingBee, setCurrentSpellingBee] = useState<SpellingBee>();
  const [currentGuess, setCurrentGuess] = useState<string>("-");
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [points, setPoints] = useState<number>(0);

  useEffect(() => {
    const thing: SpellingBee = {
      center: "i",
      outer: ["b", "e", "g", "n", "s", "l"],
      answers: ["beginnings", "signless"],
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
    //Keep track of high score, and longest word, and most words
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
    const result = isValidGuess();

    if (!result.ok) {
      console.log(result.error);
      setCurrentGuess("-");
      return;
    }

    const pointsEarned = calculatePointsFromGuess(currentGuess);
    setPoints(points + pointsEarned);
    setFoundWords([...foundWords, currentGuess]);
    updateDB();
    setCurrentGuess("-");
  }

  function isValidGuess(): Result<void, string> {
    if (!currentSpellingBee) {
      return err("No spelling bee loaded");
    }

    if (currentGuess.length <= 3) {
      return err("Too short!");
    }

    if (!currentGuess.includes(currentSpellingBee.center)) {
      return err("Missing center letter");
    }

    if (currentSpellingBee.answers.includes(currentGuess)) {
      console.log("YES");
      return ok(undefined);
    } else {
      return err("Not in word list");
    }
  }

  function calculatePointsFromGuess(guess: string): number {
    if (guess.length <= 4) {
      return 1;
    } else {
      return guess.length;
    }
  }

  return (
    <main className="w-9/12 ml-auto mr-auto max-sm:w-11/12">
      <h1 className="font-heading text-center mb-4 text-8xl max-sm:text-7xl max-xs:text-6xl">
        Spelling Bee
      </h1>
      <div className="flex gap-2 items-center justify-center mt-10">
        <section className="flex flex-col justify-center items-center mb-24 w-1/2">
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
        </section>
        <section className="border-black border-2 rounded w-5/12 h-[40rem]"></section>
      </div>
    </main>
  );
}
