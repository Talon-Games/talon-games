"use client";
// To the person who next works on this, im sorry
import { useState, useEffect } from "react";
import Notification from "@/components/general/notification";
import { useAuthContext } from "@/lib/contexts/authContext";

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

  const { user } = useAuthContext() as { user: any };

  const [notification, setNotification] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationType, setNotificationType] = useState<
    "success" | "error" | "warning"
  >("success");
  const [notificationMessage, setNotificationMessage] = useState("");

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
  const [currentSelectionNumberXY, setCurrentSelectionNumberXY] =
    useState<[number, number]>();
  const [currentTrend, setCurrentTrend] = useState<
    "down" | "across" | undefined
  >(undefined);

  const triggerNotification = (
    title: string,
    type: "success" | "error" | "warning",
    message: string,
  ) => {
    setNotification(true);
    setNotificationTitle(title);
    setNotificationType(type);
    setNotificationMessage(message);
  };

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
    if (!data) {
      triggerNotification("Failed to set number", "error", "Data not found");
      return;
    }

    let direction = currentEditDirection;
    if (!direction) {
      triggerNotification(
        "Failed to set number",
        "error",
        "Direction not found",
      );
      return;
    }

    let location = currentSelectionNumberXY;
    if (!location) {
      triggerNotification(
        "Failed to set number",
        "error",
        "Location not found",
      );
      return;
    }

    const tempData = data.map((row) => row.map((box) => ({ ...box })));

    const startX = location[0];
    const startY = location[1];
    if (direction == "across") {
      for (let x = startX; x < width; x++) {
        const getNextBlock = () => {
          if (x + 1 != width) {
            return tempData[startY][x + 1];
          } else {
            return undefined;
          }
        };

        const getCurrentState = (): "down" | "across" | undefined => {
          const nextBlock = getNextBlock();

          if (nextBlock == undefined) {
            return undefined;
          }

          if (nextBlock.state == "black") {
            if (tempData[startY][x].next == "down") {
              return "down";
            } else {
              return undefined;
            }
          }

          return "across";
        };

        let currentState = getCurrentState();

        let belongsTo = tempData[startY][x].belongsTo;
        belongsTo.push(currentEditNumber);
        tempData[startY][x].belongsTo = belongsTo;

        if (currentState == undefined) {
          break;
        } else {
          tempData[startY][x].next = currentState;
        }
      }
    } else {
      for (let y = startY; y < height; y++) {
        const getNextBlock = () => {
          if (y + 1 != height) {
            return tempData[y + 1][startX];
          } else {
            return undefined;
          }
        };

        const getCurrentState = (): "down" | "across" | undefined => {
          const nextBlock = getNextBlock();

          if (nextBlock == undefined) {
            return undefined;
          }

          if (nextBlock.state == "black") {
            if (tempData[y][startX].next == "across") {
              return "across";
            } else {
              return undefined;
            }
          }

          return "down";
        };

        let currentState = getCurrentState();

        let belongsTo = tempData[y][startX].belongsTo;
        belongsTo.push(currentEditNumber);
        tempData[y][startX].belongsTo = belongsTo;

        if (currentState == undefined) {
          break;
        } else {
          tempData[y][startX].next = currentState;
        }
      }
    }

    tempData[location[1]][location[0]].number = currentEditNumber;

    setData(tempData);
  };

  const fillNoneLettersBlack = () => {
    if (!data) {
      triggerNotification(
        "Failed to fill non-letters black",
        "error",
        "Data not found",
      );
      return;
    }
    const tempData = data.map((row) =>
      row.map((box) => ({
        ...box,
        state: box.letter === "" ? "black" : box.state,
        belongsTo: [],
      })),
    );
    setData(tempData);
  };

  const fillBlackEmpty = () => {
    if (!data) {
      triggerNotification("Failed to clear black", "error", "Data not found");
      return;
    }
    const tempData = data.map((row) =>
      row.map((box) => ({
        ...box,
        state: box.state === "black" ? "normal" : box.state,
      })),
    );
    setData(tempData);
  };

  const clearLetters = () => {
    if (!data) {
      triggerNotification("Failed to clear letters", "error", "Data not found");
      return;
    }
    const tempData = data.map((row) =>
      row.map((box) => ({
        ...box,
        letter: "",
      })),
    );
    setData(tempData);
  };

  const clearAssociations = () => {
    if (!data) {
      triggerNotification(
        "Failed to clear associations",
        "error",
        "Data not found",
      );
      return;
    }
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
    if (!data) {
      triggerNotification(
        "Failed to clear highlight and selection",
        "error",
        "Data not found",
      );
      return;
    }
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
    if (!data) {
      triggerNotification(
        "Failed to select current",
        "error",
        "Data not found",
      );
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
    if (!data) {
      triggerNotification("Failed to toggle black", "error", "Data not found");
      return;
    }

    let tempData = data.map((row) => row.map((box) => ({ ...box })));

    if (
      tempData[y][x].letter != "" ||
      tempData[y][x].number != undefined ||
      tempData[y][x].belongsTo.length != 0
    ) {
      triggerNotification(
        "Failed to toggle black",
        "error",
        "Letter, Number, or Belonging is already set",
      );
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
        triggerNotification("Failed to take action", "error", "Data not found");
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
        startLetterPlacer(x, y);
      }
    }
  };

  const startLetterPlacer = (x: number, y: number) => {
    if (!data) {
      triggerNotification(
        "Failed to start letter placer",
        "error",
        "Data not found",
      );
      return;
    }

    if (data[y][x].state == "black") {
      triggerNotification(
        "Failed to start letter placer",
        "warning",
        "Cant place letters on black squares",
      );
      return;
    }

    if (data[y][x].belongsTo.length == 0) {
      triggerNotification(
        "Failed to start letter placer",
        "warning",
        "Cant place letter on a square without an association",
      );
      return;
    }

    setCurrentTrend(data[y][x].next);

    clearHighlightAndSelection();
    selectCurrent(x, y);
    setCurrentSelectionNumberXY([x, y]);
  };

  const startNumberPlacer = (x: number, y: number) => {
    if (!data) {
      triggerNotification(
        "Failed to start number placer",
        "error",
        "Data not found",
      );
      return;
    }

    if (data[y][x].state == "black") {
      triggerNotification(
        "Failed to start number placer",
        "warning",
        "Cant place numbers on black squares",
      );
      return;
    }

    clearHighlightAndSelection();
    selectCurrent(x, y);
    setCurrentSelectionNumberXY([x, y]);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;

      if (key >= "a" && key <= "z") {
        if ((mode == "build" && editMode == "placeLetters") || mode == "play") {
          handleKeyPressForLetters(key.toUpperCase());
        }
      }

      switch (key) {
        case "ArrowRight":
          if (mode == "build" && editMode == "placeNumbers") {
            event.preventDefault();
            handleRightKeyForNumberPlacer();
          }
          break;
        case "ArrowDown":
          if (mode == "build" && editMode == "placeNumbers") {
            event.preventDefault();
            handleDownKeyForNumberPlacer();
          }
          break;
        case "Enter":
          if (mode == "build" && editMode == "placeNumbers") {
            event.preventDefault();
            handleEnterForNumberPlace();
          }
          break;
        case "Backspace":
          if (
            (mode == "build" && editMode == "placeLetters") ||
            mode == "play"
          ) {
            handleBackspaceForLetters();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mode, editMode, currentSelectionNumberXY, highlightMode, data]);

  const handleBackspaceForLetters = () => {
    if (!data) {
      triggerNotification("Failed to backspace letter", "error", "Data found");
      return;
    }

    let location = currentSelectionNumberXY;
    if (!location) {
      triggerNotification(
        "Failed to backspace letter",
        "error",
        "Location not found",
      );
      return;
    }

    let tempData = data.map((row) => row.map((box) => ({ ...box })));

    let startX = location[0];
    let startY = location[1];
    let trend = currentTrend;

    tempData[startY][startX].letter = "";

    // move the selector back
    if (trend) {
      if (
        trend == "across" &&
        tempData[startY][startX - 1].state != "black" &&
        startX - 1 >= 0
      ) {
        tempData[startY][startX].state = "normal";
        tempData[startY][startX - 1].state = "selected";
        setCurrentSelectionNumberXY([startX - 1, startY]);
      } else if (
        trend == "down" &&
        tempData[startY - 1][startX].state != "black" &&
        startY - 1 >= 0
      ) {
        tempData[startY][startX].state = "normal";
        tempData[startY - 1][startX].state = "selected";
        setCurrentSelectionNumberXY([startX, startY - 1]);
      }
    }

    setData(tempData);
  };

  const handleKeyPressForLetters = (key: string) => {
    if (!data) {
      triggerNotification("Failed to place letter", "error", "Data not found");
      return;
    }

    let location = currentSelectionNumberXY;
    if (!location) {
      triggerNotification(
        "Failed to place letter",
        "error",
        "Location not found",
      );
      return;
    }

    let tempData = data.map((row) => row.map((box) => ({ ...box })));

    let block = tempData[location[1]][location[0]];

    if (block.belongsTo.length == 0 || block.state == "black") {
      triggerNotification(
        "Failed to place letter",
        "warning",
        "Letters can only be placed on squares associated with a number",
      );
      return;
    }
    tempData[location[1]][location[0]].letter = key;
    tempData[location[1]][location[0]].state = "normal";

    if (currentTrend && tempData[location[1]][location[0]].next) {
      if (currentTrend == "across") {
        tempData[location[1]][location[0] + 1].state = "selected";
        setCurrentSelectionNumberXY([location[0] + 1, location[1]]);
      } else {
        tempData[location[1] + 1][location[0]].state = "selected";
        setCurrentSelectionNumberXY([location[0], location[1] + 1]);
      }
    }

    setData(tempData);
  };

  const handleEnterForNumberPlace = () => {
    clearHighlightAndSelection();
    setNumber();
    setCurrentEditDirection(undefined);
    setCurrentEditNumber(currentEditNumber + 1);
    setCurrentSelectionNumberXY(undefined);
    //TODO: add hint creation workflow here
  };

  const handleRightKeyForNumberPlacer = () => {
    const location = currentSelectionNumberXY;
    if (location == null || location?.length != 2) {
      triggerNotification(
        "Failed to handle right key press",
        "error",
        "Location is either not found or incorrect",
      );
      return;
    }

    setCurrentEditDirection("across");
    setHighlightMode("across");
    highlight(location[0], location[1], "across", true);
  };

  const handleDownKeyForNumberPlacer = () => {
    const location = currentSelectionNumberXY;

    if (location == null || location?.length != 2) {
      triggerNotification(
        "Failed to handle right key press",
        "error",
        "Location is either not found or incorrect",
      );

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
                  className={`w-[40px] h-[40px] border border-black cursor-pointer flex items-center justify-center relative ${
                    box.state == "highlighted" ? "border-secondary-500" : null
                  } ${
                    box.state == "selected"
                      ? "border-secondary-500 bg-secondary-50"
                      : null
                  } ${
                    box.state == "black" ? "bg-accent-900 cursor-default" : null
                  }`}
                >
                  <p className="absolute text-sm top-[1px] left-1">
                    {box.number}
                  </p>
                  <p>{box.letter}</p>
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
            <>
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
                  First place blocks, then place numbers, finally add letters.
                  If you dont follow this order things will go wrong.
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
                  {editMode == "placeLetters" ? (
                    <div className="pl-10">
                      <p>1. Select a square</p>
                      <p>2. Press a letter</p>
                    </div>
                  ) : null}
                </div>
              </section>
              <section className="flex gap-2 items-center justify-between">
                <button className="bg-red-200 p-5 rounded-lg w-full hover:bg-red-300 transition-all duration-200 ease-in-out">
                  Cancel
                </button>
                <button className="bg-secondary-200 p-5 rounded-lg w-full hover:bg-secondary-300 transition-all duration-200 ease-in-out">
                  Update
                </button>
              </section>
            </>
          ) : null}
        </section>
      </section>
      {notification ? (
        <Notification
          title={notificationTitle}
          type={notificationType}
          message={notificationMessage}
          timeout={5000}
          updateNotification={(value) => setNotification(value)}
        />
      ) : null}
    </main>
  );
}
