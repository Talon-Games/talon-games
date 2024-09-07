"use client";

import { CrossWordBoxData } from "@/app/games/crossword/page";

export default function MiniGrid({
  data,
  mode,
  debug,
  width,
  height,
  determineAssociationColor,
  takeAction,
  boxesToCheck,
}: {
  data: CrossWordBoxData[][] | undefined;
  mode: "build" | "play";
  debug: boolean;
  width: number;
  height: number;
  determineAssociationColor: any;
  takeAction: any;
  boxesToCheck: { x: number; y: number }[];
}) {
  return (
    <section className="flex flex-col max-xl:items-center">
      {data?.map((row: CrossWordBoxData[], y) => (
        <div key={y} className="flex">
          {row.map((box: CrossWordBoxData, x) => (
            <div
              key={x}
              onClick={() => takeAction(x, y)}
              className={`w-[100px] h-[100px] max-sm:w-[80px] max-sm:h-[80px] max-xs:w-[70px] max-xs:h-[70px] border-[0.5px] border-secondary-900 cursor-pointer flex items-center justify-center relative 
                  ${y == 0 ? "border-t-2 border-t-black" : ""} ${
                    y == height - 1 ? "border-b-2 border-b-black" : ""
                  } ${x == 0 ? "border-l-2 border-l-black" : ""} ${
                    x == width - 1 ? "border-r-2 border-r-black" : ""
                  }
                  ${box.state == "highlighted" ? "bg-secondary-300" : ""} ${
                    box.state == "selected" ? "!bg-primary-300" : null
                  } ${
                    box.state == "black"
                      ? "!bg-accent-900 cursor-default"
                      : null
                  } ${
                    debug && mode == "build"
                      ? `${determineAssociationColor(box)}`
                      : ""
                  }`}
            >
              <p className="absolute text-xl top-[1px] right-1">
                {mode == "build" && debug
                  ? `${
                      box.number != undefined
                        ? `${box.belongsTo.length == 1 ? "p" : "c"}`
                        : ""
                    }`
                  : ""}
              </p>
              <p className="absolute text-xl top-[1px] left-1">{box.number}</p>
              <p
                className={`text-2xl${
                  boxesToCheck.some(
                    (wordBox) => wordBox.x === x && wordBox.y === y,
                  )
                    ? `${
                        box.guess == box.answer
                          ? "text-green-700"
                          : "text-red-700"
                      }`
                    : ""
                }`}
              >{`${mode == "play" ? box.guess : box.answer} `}</p>
              <p className="absolute text-xl bottom-[1px] left-1">
                {mode == "build" && debug ? box.belongsTo.join(",") : ""}
              </p>
              <p className="absolute text-xl bottom-[1px] right-1">
                {mode == "build" && debug
                  ? `${box.next ? `${box.next == "across" ? "a" : "d"}` : ""}`
                  : ""}
              </p>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
