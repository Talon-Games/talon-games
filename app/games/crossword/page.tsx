"use client";

import { useState, useEffect } from "react";

type CrossWordBoxData = {
  letter: string;
  number?: number;
  belongsTo?: number[];
  next?: "down" | "across"; // the direction of the next box to move cursor to, should be the direction of primary word, not crossing word
  state: "normal" | "selected" | "highlighted" | "black";
};

export default function Crossword() {
  const width = 15;
  const height = 15;

  const [data, setData] = useState<CrossWordBoxData[][]>();
  const [mode, setMode] = useState<"play" | "build">("build");
  const [highlightMode, setHighlightMode] = useState<
    "down" | "across" | "both"
  >("both");
  const [editMode, setEditMode] = useState<
    "select" | "editBlack" | "placeNumbers" | "placeLetters"
  >("select");

  useEffect(() => {
    let table: CrossWordBoxData[][] = [];

    for (let i = 0; i < height; i++) {
      let row: CrossWordBoxData[] = [];

      for (let j = 0; j < width; j++) {
        let box: CrossWordBoxData = {
          letter: "",
          state: "normal",
        };
        row.push(box);
      }

      table.push(row);
    }

    setData(table);
  }, []);

  const toggleMode = () => {
    //TODO: auth check

    if (mode == "build") {
      setMode("play");
    } else {
      setMode("build");
    }
  };

  const highlight = (x: number, y: number) => {
    if (data == null) {
      return;
    }

    if (data[y][x].state == "black") {
      return;
    }

    let tempData = data.map((row) => row.map((box) => ({ ...box })));

    for (let i = 0; i < tempData.length; i++) {
      for (let j = 0; j < tempData[i].length; j++) {
        if (tempData[i][j].state == "black") {
          continue;
        }
        tempData[i][j].state = "normal";
      }
    }

    if (highlightMode == "across" || highlightMode == "both") {
      for (let i = x; i >= 0; i--) {
        if (tempData[y][i].state == "black") {
          break;
        } else {
          tempData[y][i].state = "highlighted";
        }
      }

      for (let i = x; i < width; i++) {
        if (tempData[y][i].state == "black") {
          break;
        } else {
          tempData[y][i].state = "highlighted";
        }
      }
    }

    if (highlightMode == "down" || highlightMode == "both") {
      for (let i = y; i >= 0; i--) {
        if (tempData[i][x].state == "black") {
          break;
        } else {
          tempData[i][x].state = "highlighted";
        }
      }

      for (let i = y; i < height; i++) {
        if (tempData[i][x].state == "black") {
          break;
        } else {
          tempData[i][x].state = "highlighted";
        }
      }
    }

    tempData[y][x].state = "selected";

    setData(tempData);
  };

  const fillNoneLettersBlack = () => {
    if (data == null) {
      return;
    }

    let tempData = data.map((row) => row.map((box) => ({ ...box })));

    for (let i = 0; i < tempData.length; i++) {
      for (let j = 0; j < tempData[i].length; j++) {
        if (tempData[i][j].letter == "") {
          tempData[i][j].state = "black";
        }
      }
    }

    setData(tempData);
  };

  const fillBlackEmpty = () => {
    if (data == null) {
      return;
    }

    let tempData = data.map((row) => row.map((box) => ({ ...box })));

    for (let i = 0; i < tempData.length; i++) {
      for (let j = 0; j < tempData[i].length; j++) {
        if (tempData[i][j].state == "black") {
          tempData[i][j].state = "normal";
        }
      }
    }

    setData(tempData);
  };

  const clearLetters = () => {
    if (data == null) {
      return;
    }

    let tempData = data.map((row) => row.map((box) => ({ ...box })));

    for (let i = 0; i < tempData.length; i++) {
      for (let j = 0; j < tempData[i].length; j++) {
        tempData[i][j].letter = "";
      }
    }

    setData(tempData);
  };

  const clearAssociations = () => {
    if (data == null) {
      return;
    }

    let tempData = data.map((row) => row.map((box) => ({ ...box })));

    for (let i = 0; i < tempData.length; i++) {
      for (let j = 0; j < tempData[i].length; j++) {
        tempData[i][j].letter = "";
        tempData[i][j].number = undefined;
        tempData[i][j].belongsTo = undefined;
        tempData[i][j].next = undefined;
      }
    }

    setData(tempData);
  };

  const editModeSelector = (
    mode: "select" | "editBlack" | "placeNumbers" | "placeLetters",
  ) => {
    setEditMode(mode);
  };

  const toggleBlack = (x: number, y: number) => {
    if (data == null) {
      return;
    }

    let tempData = data.map((row) => row.map((box) => ({ ...box })));

    if (
      tempData[y][x].letter != "" ||
      tempData[y][x].number != undefined ||
      tempData[y][x].next != undefined
    ) {
      return;
    }

    if (tempData[y][x].state == "black") {
      tempData[y][x].state = "normal";
    } else {
      tempData[y][x].state = "black";
    }

    setData(tempData);
  };

  const takeAction = (x: number, y: number) => {
    if (mode == "play") {
      if (data == null) {
        return;
      }

      if (data[y][x].next == "down") {
        setHighlightMode("down");
      } else if (data[y][x].next == "across") {
        setHighlightMode("across");
      }

      highlight(x, y);
    } else {
      if (editMode == "select") {
        highlight(x, y);
      } else if (editMode == "editBlack") {
        toggleBlack(x, y);
      } else if (editMode == "placeNumbers") {
      } else if (editMode == "placeLetters") {
      }
    }
  };

  return (
    <main className="py-2">
      <section className="flex justify-center gap-2">
        <section className="flex flex-col bg-accent-100 rounded-xl p-5">
          {data?.map((row: CrossWordBoxData[], y) => (
            <div key={y} className="flex">
              {row.map((box: CrossWordBoxData, x) => (
                <div
                  key={x}
                  onClick={() => takeAction(x, y)}
                  className={`w-[50px] h-[50px] border border-black cursor-pointer ${
                    box.state == "highlighted" ? "border-secondary-500" : null
                  } ${
                    box.state == "selected"
                      ? "border-secondary-500 bg-secondary-50"
                      : null
                  } ${
                    box.state == "black" ? "bg-accent-900 cursor-default" : null
                  }`}
                >
                  <p className="relative top-1 left-1">{box.number}</p>
                </div>
              ))}
            </div>
          ))}
        </section>
        <section className="flex flex-col gap-2 w-2/6">
          <section className="flex gap-2 justify-between">
            <div className="bg-accent-100 p-5 w-full rounded-xl">
              <p className="font-bold text-xl text-center">Down</p>
            </div>
            <div className="bg-accent-100 p-5 w-full rounded-xl">
              <p className="font-bold text-xl text-center">Across</p>
            </div>
          </section>
          {/*TODO: if authed and admin, show edit button then switch to edit tools panel if pressed, save button closes panel*/}
          {mode === "build" ? (
            <section className="bg-accent-100 p-5 rounded-xl">
              <p className="font-bold text-xl text-center">Edit Tools</p>
              <p className="text-red-500 text-center italic">
                There is no undo. I will not make one. Dont mess up.
              </p>
              <div className="flex gap-2">
                <button
                  className="bg-secondary-200 p-2 rounded-lg w-full hover:bg-secondary-300 transition-all duration-200 ease-in-out"
                  onClick={fillNoneLettersBlack}
                >
                  Fill Empty Black
                </button>
                <button
                  className="bg-secondary-200 p-2 rounded-lg w-full hover:bg-secondary-300 transition-all duration-200 ease-in-out"
                  onClick={fillBlackEmpty}
                >
                  Fill Black Empty
                </button>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  className="bg-secondary-200 p-2 rounded-lg w-full hover:bg-secondary-300 transition-all duration-200 ease-in-out"
                  onClick={clearLetters}
                >
                  Clear Letters
                </button>
                <button
                  className="bg-secondary-200 p-2 rounded-lg w-full hover:bg-secondary-300 transition-all duration-200 ease-in-out"
                  onClick={clearAssociations}
                >
                  Clear Associations
                </button>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <div
                  className="flex gap-2 items-center cursor-pointer"
                  onClick={() => editModeSelector("select")}
                >
                  <div
                    className={`w-[30px] h-[30px] rounded-lg border border-secondary-300 ${
                      editMode == "select" ? "bg-secondary-300" : null
                    } hover:bg-secondary-200 transition-all duration-200 ease-in-out`}
                  ></div>
                  <p>Select</p>
                </div>
                <div
                  className="flex gap-2 items-center cursor-pointer"
                  onClick={() => editModeSelector("editBlack")}
                >
                  <div
                    className={`w-[30px] h-[30px] rounded-lg border border-secondary-300 ${
                      editMode == "editBlack" ? "bg-secondary-300" : null
                    } hover:bg-secondary-200 transition-all duration-200 ease-in-out`}
                  ></div>
                  <p>Edit Black</p>
                </div>
                <div
                  className="flex gap-2 items-center cursor-pointer"
                  onClick={() => editModeSelector("placeNumbers")}
                >
                  <div
                    className={`w-[30px] h-[30px] rounded-lg border border-secondary-300 ${
                      editMode == "placeNumbers" ? "bg-secondary-300" : null
                    } hover:bg-secondary-200 transition-all duration-200 ease-in-out`}
                  ></div>
                  <p>Place Numbers</p>
                </div>
                <div
                  className="flex gap-2 items-center cursor-pointer"
                  onClick={() => editModeSelector("placeLetters")}
                >
                  <div
                    className={`w-[30px] h-[30px] rounded-lg border border-secondary-300 ${
                      editMode == "placeLetters" ? "bg-secondary-300" : null
                    } hover:bg-secondary-200 transition-all duration-200 ease-in-out`}
                  ></div>
                  <p>Place Letters</p>
                </div>
              </div>
            </section>
          ) : null}
        </section>
      </section>
    </main>
  );
}
