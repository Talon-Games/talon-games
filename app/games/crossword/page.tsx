"use client";
// To the person who next works on this, im sorry
import { useState, useEffect } from "react";

type CrossWordBoxData = {
  letter: string;
  number?: number;
  belongsTo: number[];
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
    "editBlack" | "placeNumbers" | "placeLetters"
  >("editBlack");
  const [currentEditNumber, setCurrentEditNumber] = useState(1);
  const [currentEditDirection, setCurrentEditDirection] = useState<
    "down" | "across"
  >();
  const [currentEditNumberXY, setCurrentEditNumberXY] =
    useState<[number, number]>();

  useEffect(() => {
    let table: CrossWordBoxData[][] = [];

    for (let i = 0; i < height; i++) {
      let row: CrossWordBoxData[] = [];

      for (let j = 0; j < width; j++) {
        let box: CrossWordBoxData = {
          letter: "",
          belongsTo: [],
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
      setEditMode("editBlack");
      setHighlightMode("both");
    }
  };

  const highlight = (
    x: number,
    y: number,
    direction: "across" | "down" | "both",
    onlyDirections: boolean,
  ) => {
    if (!data || data[y][x].state === "black") return;

    const tempData = data.map((row) => row.map((box) => ({ ...box })));

    // Reset non-black boxes
    tempData.forEach((row) =>
      row.forEach((box) => {
        if (box.state !== "black") box.state = "normal";
      }),
    );

    // Highlight in specified directions
    if (direction === "across" || direction === "both") {
      if (!onlyDirections) {
        for (let i = x; i >= 0; i--) {
          if (tempData[y][i].state === "black") break;
          tempData[y][i].state = "highlighted";
        }
      }
      for (let i = x; i < width; i++) {
        if (tempData[y][i].state === "black") break;
        tempData[y][i].state = "highlighted";
      }
    }

    if (direction === "down" || direction === "both") {
      if (!onlyDirections) {
        for (let i = y; i >= 0; i--) {
          if (tempData[i][x].state === "black") break;
          tempData[i][x].state = "highlighted";
        }
      }
      for (let i = y; i < height; i++) {
        if (tempData[i][x].state === "black") break;
        tempData[i][x].state = "highlighted";
      }
    }

    tempData[y][x].state = "selected";
    setData(tempData);
  };

  const setNumber = () => {
    if (!data) return;

    let direction = currentEditDirection;
    if (!direction) return;

    let location = currentEditNumberXY;
    if (!location) return;

    const tempData = data.map((row) => row.map((box) => ({ ...box })));

    if (direction == "across") {
      for (let i = location[0]; i < width; i++) {
        if (tempData[location[1]][i].state == "black") {
          break;
        }
        let belongsTo = tempData[location[1]][i].belongsTo;
        belongsTo.push(currentEditNumber);
        tempData[location[1]][i].belongsTo = belongsTo;
      }
    } else {
      for (let i = location[1]; i < height; i++) {
        if (tempData[i][location[0]].state == "black") {
          break;
        }
        let belongsTo = tempData[i][location[0]].belongsTo;
        belongsTo.push(currentEditNumber);
        tempData[i][location[0]].belongsTo = belongsTo;
      }
    }

    tempData[location[1]][location[0]].number = currentEditNumber;

    setData(tempData);
  };

  const fillNoneLettersBlack = () => {
    if (!data) return;
    const tempData = data.map((row) =>
      row.map((box) => ({
        ...box,
        state: box.letter === "" ? "black" : box.state,
      })),
    );
    setData(tempData);
  };

  const fillBlackEmpty = () => {
    if (!data) return;
    const tempData = data.map((row) =>
      row.map((box) => ({
        ...box,
        state: box.state === "black" ? "normal" : box.state,
      })),
    );
    setData(tempData);
  };

  const clearLetters = () => {
    if (!data) return;
    const tempData = data.map((row) =>
      row.map((box) => ({
        ...box,
        letter: "",
      })),
    );
    setData(tempData);
  };

  const clearAssociations = () => {
    if (!data) return;
    const tempData = data.map((row) =>
      row.map((box) => ({
        ...box,
        letter: "",
        number: undefined,
        belongsTo: [],
        next: undefined,
      })),
    );
    setData(tempData);
  };

  const clearHighlightAndSelection = () => {
    if (!data) return;
    const tempData = data.map((row) =>
      row.map((box) => ({
        ...box,
        state:
          box.state === "highlighted" || box.state === "selected"
            ? "normal"
            : box.state,
      })),
    );
    setData(tempData);
  };

  const selectCurrent = (x: number, y: number) => {
    if (data == null) {
      return;
    }

    let tempData = data.map((row) => row.map((box) => ({ ...box })));

    tempData[y][x].state = "selected";

    setData(tempData);
  };

  const editModeSelector = (
    mode: "editBlack" | "placeNumbers" | "placeLetters",
  ) => {
    clearHighlightAndSelection();
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
    clearHighlightAndSelection();
    if (mode == "play") {
      if (data == null) {
        return;
      }

      if (data[y][x].next == "down") {
        setHighlightMode("down");
      } else if (data[y][x].next == "across") {
        setHighlightMode("across");
      }

      highlight(x, y, highlightMode, false);
    } else {
      if (editMode == "editBlack") {
        toggleBlack(x, y);
      } else if (editMode == "placeNumbers") {
        startNumberPlacer(x, y);
      } else if (editMode == "placeLetters") {
      }
    }
  };

  const startNumberPlacer = (x: number, y: number) => {
    clearHighlightAndSelection();
    selectCurrent(x, y);
    setCurrentEditNumberXY([x, y]);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowRight":
          if (mode == "build" && editMode == "placeNumbers") {
            handleRightKeyForNumberPlacer();
          }
          break;
        case "ArrowDown":
          if (mode == "build" && editMode == "placeNumbers") {
            handleDownKeyForNumberPlacer();
          }
          break;
        case "Enter":
          if (mode == "build" && editMode == "placeNumbers") {
            handleEnterForNumberPlace();
          }
          break;
        case "Escape":
          console.log("Escape key pressed");
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mode, editMode, currentEditNumberXY, highlightMode, data]);

  const handleEnterForNumberPlace = () => {
    clearHighlightAndSelection();
    setNumber();
    setCurrentEditDirection(undefined);
    setCurrentEditNumber(currentEditNumber + 1);
    setCurrentEditNumberXY(undefined);
  };

  const handleRightKeyForNumberPlacer = () => {
    const location = currentEditNumberXY;
    if (location == null || location?.length != 2) {
      return;
    }

    setCurrentEditDirection("across");
    setHighlightMode("across");
    highlight(location[0], location[1], "across", true);
  };

  const handleDownKeyForNumberPlacer = () => {
    const location = currentEditNumberXY;

    if (location == null || location?.length != 2) {
      return;
    }
    setCurrentEditDirection("down");
    setHighlightMode("down");
    highlight(location[0], location[1], "down", true);
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
                  className={`w-[40px] h-[40px] border border-black cursor-pointer ${
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
                  <p>{box.belongsTo}</p>
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
              <p className="text-red-500 text-center italic">
                First place blocks, then place numbers, finally add letters. If
                you dont follow this order things will go wrong.
              </p>
              <div className="flex flex-col gap-2 mt-2">
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
                {editMode == "placeNumbers" ? (
                  <div className="pl-10">
                    <p>1. Select a square</p>
                    <p>2. Use right and down keys to set a direction</p>
                    <p>3. Press enter to confirm number placement</p>
                    <p>Press esc at any time before pressing enter to cancel</p>
                  </div>
                ) : null}
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
