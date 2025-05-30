"use client";

import { useState, useEffect } from "react";

export type SpellingBee = {
  center: string;
  outer: string[];
  answers: string[];
};

const Hex = ({
  letter,
  center = false,
}: {
  letter?: string;
  center?: boolean;
}) => (
  <svg viewBox="0 0 120 104" className="h-[74px] w-[74px]">
    <polygon
      points="0,52 30,0 90,0 120,52 90,104 30,104"
      className={`${
        center
          ? "fill-secondary-400 hover:fill-secondary-500"
          : "fill-gray-200 hover:fill-gray-300"
      } transition-all duration-200 ease-in-out`}
    />
    <text
      x="50%"
      y="50%"
      dy="10.75%"
      textAnchor="middle"
      className="text-black text-[32px] font-bold font-sans select-none"
    >
      {letter?.toUpperCase()}
    </text>
  </svg>
);

export default function SpellingBee() {
  const [currentSpellingBee, setCurrentSpellingBee] = useState<SpellingBee>();
  const [currentGuess, setCurrentGuess] = useState<string>("-");

  useEffect(() => {
    const thing: SpellingBee = {
      center: "i",
      outer: ["b", "e", "g", "n", "s", "l"],
      answers: ["beginnings", "signless"],
    };

    setCurrentSpellingBee(thing);
  }, []);

  function hexPressed(letter: string) {
    if (currentGuess == "-") {
      setCurrentGuess(letter);
      return;
    }
    setCurrentGuess(currentGuess + letter);
  }

  return (
    <main className="w-9/12 ml-auto mr-auto max-sm:w-11/12">
      <h1 className="font-heading text-center mb-4 text-8xl max-sm:text-7xl max-xs:text-6xl">
        Spelling Bee
      </h1>
      <section className="flex flex-col justify-center items-center">
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
          <div className="inline-block scale-[1.5] origin-top relative w-[300px] h-[300px]">
            {/* Top */}
            <div
              className="absolute top-[45px] left-1/2 -translate-x-1/2 cursor-pointer active:scale-95"
              onClick={() => hexPressed(currentSpellingBee.outer[0])}
            >
              <Hex letter={currentSpellingBee.outer[0]} />
            </div>

            {/* Upper Left */}
            <div
              className="absolute top-[79px] left-[54px] cursor-pointer active:scale-95"
              onClick={() => hexPressed(currentSpellingBee.outer[1])}
            >
              <Hex letter={currentSpellingBee.outer[1]} />
            </div>

            {/* Upper Right */}
            <div
              className="absolute top-[79px] right-[54px] cursor-pointer active:scale-95"
              onClick={() => hexPressed(currentSpellingBee.outer[2])}
            >
              <Hex letter={currentSpellingBee.outer[2]} />
            </div>

            {/* Center */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer active:scale-95"
              onClick={() => hexPressed(currentSpellingBee.center)}
            >
              <Hex letter={currentSpellingBee.center} center />
            </div>

            {/* Lower Left */}
            <div
              className="absolute bottom-[79px] left-[54px] cursor-pointer active:scale-95"
              onClick={() => hexPressed(currentSpellingBee.outer[3])}
            >
              <Hex letter={currentSpellingBee.outer[3]} />
            </div>

            {/* Lower Right */}
            <div
              className="absolute bottom-[79px] right-[54px] cursor-pointer active:scale-95"
              onClick={() => hexPressed(currentSpellingBee.outer[4])}
            >
              <Hex letter={currentSpellingBee.outer[4]} />
            </div>

            {/* Bottom */}
            <div
              className="absolute bottom-[45px] left-1/2 -translate-x-1/2 cursor-pointer active:scale-95"
              onClick={() => hexPressed(currentSpellingBee.outer[5])}
            >
              <Hex letter={currentSpellingBee.outer[5]} />
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
