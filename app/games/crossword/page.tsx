"use client";
// To the person who next works on this, im sorry
import { useState, useEffect } from "react";
import Notification from "@/components/general/notification";
import { useAuthContext } from "@/lib/contexts/authContext";
import { auth } from "@/firebase/config";
import getRoles from "@/firebase/db/getRoles";
import saveCrossword from "@/firebase/db/games/crossword/saveCrossword";
import getCrossword from "@/firebase/db/games/crossword/getCrossword";
import formatDate from "@/utils/formatDate";
import decodeJsonData from "@/utils/games/crossword/decodeJsonData";
import generateSimpleHash from "@/utils/games/simpleHash";
import Stopwatch from "@/components/games/stopwatch";
import { useRouter } from "next/navigation";
import getCompletedCrosswords from "@/firebase/db/games/crossword/getCompletedCrosswords";
import updateCompletedCrosswords from "@/firebase/db/games/crossword/updateCompletedCrosswords";
import getHighScore from "@/firebase/db/games/crossword/getHighScore";
import setHighScore from "@/firebase/db/games/crossword/setHighScore";
import Button from "@/components/general/button";
import ConnectedButton from "@/components/general/connectedButtons";

export type Crossword = {
  data: string; // as json
  hints: string; // as json
  author: string;
  published: string;
};

export type CrossWordBoxData = {
  answer: string;
  guess: string;
  number?: number;
  belongsTo: number[];
  next?: "down" | "across"; // the direction of the next box to move cursor to, should be the direction of primary word, not crossing word
  state: "normal" | "selected" | "highlighted" | "black";
};

export type CrosswordHints = {
  across: CrossWordHint[];
  down: CrossWordHint[];
};

export type CrossWordHint = {
  hint: string;
  number: number;
};

export default function Crossword() {
  const width = 16;
  const height = 16;

  const router = useRouter();
  const { user } = useAuthContext() as { user: any };

  const [notification, setNotification] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationType, setNotificationType] = useState<
    "success" | "error" | "warning"
  >("success");
  const [notificationMessage, setNotificationMessage] = useState("");

  const [buildData, setBuildData] = useState<CrossWordBoxData[][]>();
  const [fromDbData, setFromDbData] = useState<CrossWordBoxData[][]>();
  const [buildHints, setBuildHints] = useState<CrosswordHints>();
  const [fromDbHints, setFromDbHints] = useState<CrosswordHints>();
  const [showAssociations, setShowAssociations] = useState(false);
  const [debug, setDebug] = useState(false);

  const [author, setAuthor] = useState("");
  const [published, setPublished] = useState("");

  const [mode, setMode] = useState<"play" | "build">("play");
  const [highlightMode, setHighlightMode] = useState<
    "down" | "across" | "both"
  >("both");
  const [editMode, setEditMode] = useState<
    "editBlack" | "placeNumbers" | "removeNumbers" | "placeLetters"
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
  const [checked, setChecked] = useState(false);
  const [singleWordChecked, setSingleWordChecked] = useState(false);
  const [wordBoxes, setWordBoxes] = useState<{
    num: number;
    boxes: { x: number; y: number }[];
  }>({ num: 0, boxes: [] });

  const [showHintCreationPopup, setShowHintCreationPopup] = useState(false);
  const [hintNumber, setHintNumber] = useState<number | undefined>(undefined);
  const [hintDirection, setHintDirection] = useState<
    "down" | "across" | undefined
  >(undefined);
  const [hint, setHint] = useState("");

  const [isMaksim, setIsMaksim] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHelper, setIsHelper] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [stoppedTime, setStoppedTime] = useState<number | null>(null);
  const [won, setWon] = useState(false);

  const [highScoreTime, setHighScoreTime] = useState("");
  const [highScoreDate, setHighScoreDate] = useState("");
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  const playAgain = () => {
    setIsRunning(false);
    setIsReset(true);
    setStoppedTime(null);
    setWon(false);
    clearBoard();
  };

  const handleResetComplete = () => {
    setIsReset(false);
  };

  const handleStopTime = (time: number) => {
    setStoppedTime(time);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0",
    )}`;
  };
  useEffect(() => {
    if (user) {
      getRoles(auth.currentUser).then(
        (roles: { isMaksim: boolean; isAdmin: boolean; isHelper: boolean }) => {
          setIsMaksim(roles.isMaksim);
          setIsAdmin(roles.isAdmin);
          setIsHelper(roles.isHelper);
        },
      );
    }
  });

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
    getCrossword("full").then((data) => {
      loadStringData(data);
    });
  }, []);

  const generateNewTable = () => {
    let table: CrossWordBoxData[][] = [];

    for (let i = 0; i < height; i++) {
      let row: CrossWordBoxData[] = [];

      for (let j = 0; j < width; j++) {
        let box: CrossWordBoxData = {
          answer: "",
          guess: "",
          belongsTo: [],
          state: "normal",
        };
        row.push(box);
      }

      table.push(row);
    }

    return table;
  };

  const initNewHints = () => {
    let hints: CrosswordHints = {
      across: [],
      down: [],
    };

    return hints;
  };

  const toggleMode = () => {
    if (!user) {
      triggerNotification(
        "Failed to toggle mode",
        "error",
        "You must have an account",
      );
    }

    if (!isHelper && !isAdmin && !isMaksim) {
      triggerNotification(
        "Failed to toggle mode",
        "error",
        "You must have a role",
      );
    }

    setChecked(false);
    setIsRunning(false);
    setIsReset(true);
    setStoppedTime(null);
    setWon(false);
    clearBoard();

    if (mode == "build") {
      setBuildData(fromDbData);
      setBuildHints(fromDbHints);
      setMode("play");
    } else {
      startBuildWorkflow();
    }
  };

  const startBuildWorkflow = () => {
    setEditMode("editBlack");
    setHighlightMode("both");
    setCurrentEditNumber(1);
    let table = generateNewTable();
    let newHints = initNewHints();

    setBuildHints(newHints);
    setBuildData(table);
    setMode("build");
  };

  const cancelBuildWorkflow = () => {
    setEditMode("editBlack");
    setHighlightMode("both");
    setCurrentEditNumber(1);

    let table = generateNewTable();
    let newHints = initNewHints();

    setBuildHints(newHints);
    setBuildData(table);
  };

  function highlight(
    x: number,
    y: number,
    direction: "across" | "down" | "both",
    onlyDirections: boolean,
    data: CrossWordBoxData[][],
  ): CrossWordBoxData[][] {
    if (data[y][x].state === "black") return data;

    // Rest non-black boxes
    data.forEach((row) =>
      row.forEach((box) => {
        if (box.state !== "black") box.state = "normal";
      }),
    );

    // Highlight in specified directions
    if (direction === "across" || direction === "both") {
      if (!onlyDirections) {
        for (let i = x; i >= 0; i--) {
          if (data[y][i].state === "black") break;
          if (data[y][i].number) {
            data[y][i].state = "highlighted";
            break;
          }
          data[y][i].state = "highlighted";
        }
      }
      for (let i = x; i < width; i++) {
        if (data[y][i].state === "black") break;
        data[y][i].state = "highlighted";
      }
    }

    if (direction === "down" || direction === "both") {
      if (!onlyDirections) {
        for (let i = y; i >= 0; i--) {
          if (data[i][x].state === "black") break;
          if (data[i][x].number) {
            data[i][x].state = "highlighted";
            break;
          }
          data[i][x].state = "highlighted";
        }
      }
      for (let i = y; i < height; i++) {
        if (data[i][x].state === "black") break;
        data[i][x].state = "highlighted";
      }
    }

    data[y][x].state = "selected";
    return data;
  }

  function setNumber(data: CrossWordBoxData[][]): CrossWordBoxData[][] {
    let direction = currentEditDirection;
    if (!direction) {
      triggerNotification(
        "Failed to set number",
        "error",
        "Direction not found",
      );
      return data;
    }
    let location = currentSelectionNumberXY;
    if (!location) {
      triggerNotification(
        "Failed to set number",
        "error",
        "Location not found",
      );
      return data;
    }

    const startX = location[0];
    const startY = location[1];

    let skipAdd = data[startY][startX].number ? true : false;

    if (!skipAdd) {
      data[startY][startX].number = currentEditNumber;
    }

    const number = data[startY]?.[startX]?.number;
    const valueToPush = skipAdd && number ? number : currentEditNumber;

    if (buildHints) {
      if (direction == "across") {
        for (let i = 0; i < buildHints.across.length; i++) {
          if (buildHints.across[i].number == valueToPush) {
            triggerNotification(
              "Failed to set number",
              "error",
              "Number across already exists",
            );
            return data;
          }
        }
      } else {
        for (let i = 0; i < buildHints.down.length; i++) {
          if (buildHints.down[i].number == valueToPush) {
            triggerNotification(
              "Failed to set number",
              "error",
              "Number down already exists",
            );
            return data;
          }
        }
      }
    }

    if (direction == "across") {
      for (let x = startX; x < width; x++) {
        const getNextBlock = () => {
          if (x + 1 != width) {
            return data[startY][x + 1];
          } else {
            return undefined;
          }
        };

        const getCurrentState = (
          nextBlock: CrossWordBoxData | undefined,
        ): {
          direction: "down" | "across";
          possible: boolean;
        } => {
          if (nextBlock == undefined) {
            return { direction: "across", possible: true };
          }

          if (nextBlock.state == "black") {
            if (data[startY][x].next == "down") {
              return { direction: "down", possible: true };
            } else {
              return { direction: "across", possible: false };
            }
          }

          return { direction: "across", possible: true };
        };

        let nextBlock = getNextBlock();

        let currentState = getCurrentState(nextBlock);

        let belongsTo = data[startY][x].belongsTo;
        if (!belongsTo.includes(valueToPush)) {
          belongsTo.push(valueToPush);
        }
        data[startY][x].belongsTo = belongsTo;

        data[startY][x].next = currentState.direction;

        if (nextBlock == undefined || nextBlock.state == "black") {
          break;
        }
      }
    } else {
      for (let y = startY; y < height; y++) {
        const getNextBlock = () => {
          if (y + 1 != height) {
            return data[y + 1][startX];
          } else {
            return undefined;
          }
        };

        const getCurrentState = (
          nextBlock: CrossWordBoxData | undefined,
        ): {
          direction: "down" | "across";
          possible: boolean;
        } => {
          if (nextBlock == undefined) {
            return { direction: "down", possible: true };
          }

          if (nextBlock.state == "black") {
            if (data[y][startX].next == "across") {
              return { direction: "across", possible: true };
            } else {
              return { direction: "down", possible: false };
            }
          }

          return { direction: "down", possible: true };
        };

        let nextBlock = getNextBlock();

        let currentState = getCurrentState(nextBlock);

        let belongsTo = data[y][startX].belongsTo;
        if (!belongsTo.includes(valueToPush)) {
          belongsTo.push(valueToPush);
        }
        data[y][startX].belongsTo = belongsTo;

        data[y][startX].next = currentState.direction;

        if (nextBlock == undefined || nextBlock.state == "black") {
          break;
        }
      }
    }

    if (!skipAdd) {
      addNewHintToList(direction, currentEditNumber);
      setCurrentEditNumber(currentEditNumber + 1);
    } else {
      let num = data[startY][startX].number ? data[startY][startX].number : -1;
      if (!num) {
        return data;
      }

      addNewHintToList(direction, num);
    }

    return data;
  }

  const fillNoneLettersBlack = () => {
    if (!buildData) {
      triggerNotification(
        "Failed to fill non-letters black",
        "error",
        "Data not found",
      );
      return;
    }
    const tempData = buildData.map((row) =>
      row.map((box) => ({
        ...box,
        state:
          box.answer === "" && box.belongsTo.length == 0 ? "black" : box.state,
      })),
    );
    setBuildData(tempData);
  };

  const clearBoard = () => {
    if (!buildData) {
      triggerNotification(
        "Failed to fill non-letters black",
        "error",
        "Data not found",
      );
      return;
    }

    let tempData = buildData.map((row) => row.map((box) => ({ ...box })));

    for (let y = 0; y < tempData.length; y++) {
      for (let x = 0; x < tempData.length; x++) {
        if (tempData[y][x].state == "black") {
          continue;
        } else {
          tempData[y][x].state = "normal";
          tempData[y][x].guess = "";
        }
      }
    }

    setCurrentSelectionNumberXY(undefined);

    setBuildData(tempData);
  };

  const fillBlackEmpty = () => {
    if (!buildData) {
      triggerNotification("Failed to clear black", "error", "Data not found");
      return;
    }
    const tempData = buildData.map((row) =>
      row.map((box) => ({
        ...box,
        state: box.state === "black" ? "normal" : box.state,
      })),
    );
    setBuildData(tempData);
  };

  const clearLetters = () => {
    if (!buildData) {
      triggerNotification("Failed to clear letters", "error", "Data not found");
      return;
    }
    const tempData = buildData.map((row) =>
      row.map((box) => ({
        ...box,
        answer: "",
      })),
    );
    setBuildData(tempData);
  };

  const clearAssociations = () => {
    if (!buildData) {
      triggerNotification(
        "Failed to clear associations",
        "error",
        "Data not found",
      );
      return;
    }
    const tempData = buildData.map((row) =>
      row.map((box) => ({
        ...box,
        answer: "",
        number: undefined,
        belongsTo: [],
        next: undefined,
      })),
    );

    setCurrentEditNumber(1);
    setBuildHints(initNewHints());
    setBuildData(tempData);
  };

  function clearHighlightAndSelection(data: CrossWordBoxData[][]) {
    return data.map((row) =>
      row.map((box) => ({
        ...box,
        state:
          box.state === "highlighted" || box.state === "selected"
            ? "normal"
            : box.state,
      })),
    );
  }

  function selectCurrent(
    x: number,
    y: number,
    data: CrossWordBoxData[][],
  ): CrossWordBoxData[][] {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (data[y][x].state == "selected") {
          data[y][x].state = "normal";
        }
      }
    }

    data[y][x].state = "selected";

    return data;
  }

  const editModeSelector = (
    mode: "editBlack" | "placeNumbers" | "removeNumbers" | "placeLetters",
  ) => {
    if (!buildData) {
      triggerNotification(
        "Failed to change build mode",
        "error",
        "Data not found",
      );
      return;
    }

    let tempData = buildData.map((row) => row.map((box) => ({ ...box })));

    clearHighlightAndSelection(tempData);
    setBuildData(tempData);
    setEditMode(mode);
  };

  function startNumberRemover(
    x: number,
    y: number,
    data: CrossWordBoxData[][],
  ): CrossWordBoxData[][] {
    let deletionNumber = data[y][x].number;

    if (!deletionNumber) {
      return data;
    }

    data[y][x].number = undefined;
    let downShifted = downShift(data, deletionNumber);

    setCurrentEditNumber(currentEditNumber - 1);

    return downShifted;
  }

  function toggleBlack(
    x: number,
    y: number,
    data: CrossWordBoxData[][],
  ): CrossWordBoxData[][] {
    const calcTempData = (): CrossWordBoxData[][] | false => {
      if (data[y][x].number != undefined) {
        let num = data[y][x].number;

        if (data[y][x].belongsTo.length > 1) {
          triggerNotification(
            "Failed to toggle black",
            "error",
            "Remove parent numbers before deleting child number",
          );
          return false;
        }

        if (!num) {
          return data;
        }
        setCurrentEditNumber(currentEditNumber - 1);

        return downShift(data, num);
      } else {
        return data;
      }
    };

    let tempData = calcTempData();

    if (tempData == false) {
      return data;
    }

    tempData[y][x].answer = "";
    tempData[y][x].belongsTo = [];
    tempData[y][x].next = undefined;
    tempData[y][x].number = undefined;

    if (tempData[y][x].state == "black") {
      tempData[y][x].state = "normal";
    } else {
      tempData[y][x].state = "black";
    }

    return tempData;
  }

  function downShift(
    data: CrossWordBoxData[][],
    deletionNumber: number,
  ): CrossWordBoxData[][] {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (data[y][x].state == "black") {
          continue;
        }

        let num = data[y][x].number;

        if (num && num > deletionNumber) {
          data[y][x].number = num - 1;
        }

        let belongsTo = data[y][x].belongsTo.filter(
          (num) => num !== deletionNumber,
        );

        data[y][x].belongsTo = belongsTo.map((num) =>
          num > deletionNumber ? num - 1 : num,
        );
      }
    }

    let tempHints = buildHints;

    if (tempHints) {
      tempHints.down = tempHints.down.filter(
        (hint) => hint.number !== deletionNumber,
      );
      tempHints.across = tempHints.across.filter(
        (hint) => hint.number !== deletionNumber,
      );

      tempHints.down = tempHints.down.map(({ hint, number }) =>
        number > deletionNumber
          ? { hint: hint, number: number - 1 }
          : { hint: hint, number: number },
      );

      tempHints.across = tempHints.across.map(({ hint, number }) =>
        number > deletionNumber
          ? { hint: hint, number: number - 1 }
          : { hint: hint, number: number },
      );

      setBuildHints(tempHints);
    }

    return data;
  }

  const takeAction = (x: number, y: number) => {
    //TODO: something for mobile support prob here
    if (!buildData) {
      triggerNotification("Failed take action", "error", "Data not found");
      return;
    }

    if (mode == "play" && !isRunning && !won) {
      setIsRunning(true);
    }

    let tempData = buildData.map((row) => row.map((box) => ({ ...box })));
    tempData = clearHighlightAndSelection(tempData);

    if (mode == "play") {
      tempData = startLetterPlacer(x, y, tempData);
    } else {
      if (editMode == "editBlack") {
        tempData = toggleBlack(x, y, tempData);
      } else if (editMode == "placeNumbers") {
        tempData = startNumberPlacer(x, y, tempData);
      } else if (editMode == "removeNumbers") {
        tempData = startNumberRemover(x, y, tempData);
      } else if (editMode == "placeLetters") {
        tempData = startLetterPlacer(x, y, tempData);
      }
    }

    setBuildData(tempData);
  };

  function getBoxesInDirection(
    startX: number,
    startY: number,
    direction: "across" | "down",
    data: CrossWordBoxData[][],
  ): { num: number; boxes: { x: number; y: number }[] } {
    let boxes: { num: number; boxes: { x: number; y: number }[] } = {
      num: 0,
      boxes: [],
    };

    if (direction == "across") {
      // scan left till number black or edge
      for (let x = startX; x > 0; x--) {
        if (data[startY][x].state == "black") {
          break;
        } else if (data[startY][x].number != undefined) {
          let num = data[startY][x].number;
          if (!num) {
            return boxes;
          }
          boxes.num = num;
          boxes.boxes.push({ x: x, y: startY });
          break;
        } else {
          boxes.boxes.push({ x: x, y: startY });
        }
      }

      // scan right till black or edge
      for (let x = startX + 1; x < data.length; x++) {
        if (data[startY][x].state == "black") {
          break;
        } else {
          boxes.boxes.push({ x: x, y: startY });
        }
      }
    } else {
      // scan up till number black or edge
      for (let y = startY; y > 0; y--) {
        if (data[y][startX].state == "black") {
          break;
        } else if (data[y][startX].number != undefined) {
          let num = data[y][startX].number;
          if (!num) {
            return boxes;
          }
          boxes.num = num;
          boxes.boxes.push({ x: startX, y: y });
          break;
        } else {
          boxes.boxes.push({ x: startX, y: y });
        }
      }

      // scan down till black or edge
      for (let y = startY + 1; y < data.length; y++) {
        if (data[y][startX].state == "black") {
          break;
        } else {
          boxes.boxes.push({ x: startX, y: y });
        }
      }
    }

    return boxes;
  }

  function startLetterPlacer(
    x: number,
    y: number,
    data: CrossWordBoxData[][],
  ): CrossWordBoxData[][] {
    if (data[y][x].state == "black") {
      triggerNotification(
        "Failed to start letter placer",
        "warning",
        "Cant place letters on black squares",
      );
      return data;
    }

    let next = data[y][x].next;

    if (!next) {
      setCurrentTrend(data[y][x].next);
      data = clearHighlightAndSelection(data);
      data = selectCurrent(x, y, data);
    } else {
      if (
        currentSelectionNumberXY != undefined &&
        currentSelectionNumberXY.length == 2 &&
        currentSelectionNumberXY[0] == x &&
        currentSelectionNumberXY[1] == y
      ) {
        if (currentTrend == "across") {
          data = highlight(x, y, "down", mode == "play" ? false : true, data);
          const boxes = getBoxesInDirection(x, y, "down", data);
          updateHintFromWordBoxes(boxes, "down"); //TODO: if in build, open hint edit box here.
          setWordBoxes(boxes);
          setCurrentTrend("down");
        } else {
          data = highlight(x, y, "across", mode == "play" ? false : true, data);
          const boxes = getBoxesInDirection(x, y, "across", data);
          updateHintFromWordBoxes(boxes, "across");
          setWordBoxes(boxes);
          setCurrentTrend("across");
        }
      } else {
        const boxes = getBoxesInDirection(x, y, next, data);
        updateHintFromWordBoxes(boxes, next);
        setWordBoxes(boxes);
        setCurrentTrend(data[y][x].next);
        data = highlight(x, y, next, mode == "play" ? false : true, data);
      }
    }

    setCurrentSelectionNumberXY([x, y]);

    return data;
  }

  function updateHintFromWordBoxes(
    boxes: { num: number; boxes: { x: number; y: number }[] },
    direction: "down" | "across",
  ) {
    if (mode == "build" || !buildHints) {
      return;
    }

    if (direction == "across") {
      for (let i = 0; i < buildHints.across.length; i++) {
        if (buildHints.across[i].number == boxes.num) {
          setHint(buildHints.across[i].hint);
          setHintNumber(buildHints.across[i].number);
          return;
        }
      }
    } else {
      for (let i = 0; i < buildHints.down.length; i++) {
        if (buildHints.down[i].number == boxes.num) {
          setHint(buildHints.down[i].hint);
          setHintNumber(buildHints.down[i].number);
          return;
        }
      }
    }
  }

  function startNumberPlacer(
    x: number,
    y: number,
    data: CrossWordBoxData[][],
  ): CrossWordBoxData[][] {
    if (data[y][x].state == "black") {
      triggerNotification(
        "Failed to start number placer",
        "warning",
        "Cant place numbers on black squares",
      );
      return data;
    }

    data = clearHighlightAndSelection(data);
    data = selectCurrent(x, y, data);
    setCurrentSelectionNumberXY([x, y]);

    return data;
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;

      if (key >= "a" && key <= "z") {
        if (
          (mode == "build" &&
            editMode == "placeLetters" &&
            !showHintCreationPopup) ||
          mode == "play"
        ) {
          handleKeyPressForLetters(key.toUpperCase());
        }
      }

      switch (key) {
        case "ArrowRight":
          if (
            (mode == "build" &&
              (editMode == "placeNumbers" || editMode == "placeLetters") &&
              !showHintCreationPopup) ||
            mode == "play"
          ) {
            event.preventDefault();
            handleRightKey();
          }
          break;
        case "ArrowDown":
          if (
            (mode == "build" &&
              (editMode == "placeNumbers" || editMode == "placeLetters") &&
              !showHintCreationPopup) ||
            mode == "play"
          ) {
            event.preventDefault();
            handleDownKey();
          }
          break;
        case "Enter":
          if (
            mode == "build" &&
            editMode == "placeNumbers" &&
            !showHintCreationPopup
          ) {
            event.preventDefault();
            handleEnterForNumberPlace();
          }
          break;
        case "Backspace":
          if (
            (mode == "build" &&
              editMode == "placeLetters" &&
              !showHintCreationPopup) ||
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
  }, [
    mode,
    editMode,
    currentSelectionNumberXY,
    highlightMode,
    buildData,
    hintNumber,
  ]);

  const handleBackspaceForLetters = () => {
    if (!buildData) {
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

    let tempData = buildData.map((row) => row.map((box) => ({ ...box })));

    let startX = location[0];
    let startY = location[1];
    let trend = currentTrend;

    if (mode == "play") {
      tempData[startY][startX].guess = "";
    } else {
      tempData[startY][startX].answer = "";
    }
    // move the selector back
    if (trend) {
      if (
        trend == "across" &&
        tempData[startY][startX - 1].state != "black" &&
        startX - 1 >= 0
      ) {
        tempData[startY][startX].state = "highlighted";
        tempData[startY][startX - 1].state = "selected";
        setCurrentSelectionNumberXY([startX - 1, startY]);
      } else if (
        trend == "down" &&
        tempData[startY - 1][startX].state != "black" &&
        startY - 1 >= 0
      ) {
        tempData[startY][startX].state = "highlighted";
        tempData[startY - 1][startX].state = "selected";
        setCurrentSelectionNumberXY([startX, startY - 1]);
      }
    }

    setBuildData(tempData);
  };

  const handleKeyPressForLetters = (key: string) => {
    if (!buildData) {
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

    let tempData = buildData.map((row) => row.map((box) => ({ ...box })));

    let block = tempData[location[1]][location[0]];
    if (block.state == "black") {
      triggerNotification(
        "Failed to place letter",
        "warning",
        "Letters cant be placed on black squares",
      );
      return;
    }
    if (mode == "play") {
      tempData[location[1]][location[0]].guess = key;
    } else {
      tempData[location[1]][location[0]].answer = key;
    }

    if (currentTrend) {
      if (
        currentTrend == "across" &&
        location[0] + 1 != width &&
        tempData[location[1]][location[0] + 1].state != "black"
      ) {
        tempData[location[1]][location[0]].state = "highlighted";
        let next = findNextSelectionSpot(
          tempData,
          "across",
          location[0],
          location[1],
        );
        tempData[next.y][next.x].state = "selected";
        setCurrentSelectionNumberXY([next.x, next.y]);
      } else if (
        currentTrend == "down" &&
        location[1] + 1 != height &&
        tempData[location[1] + 1][location[0]].state != "black"
      ) {
        tempData[location[1]][location[0]].state = "highlighted";
        let next = findNextSelectionSpot(
          tempData,
          "down",
          location[0],
          location[1],
        );
        tempData[next.y][next.x].state = "selected";
        setCurrentSelectionNumberXY([next.x, next.y]);
      }
    }

    let won = detectWin(tempData);

    setBuildData(tempData);

    if (won) {
      setIsRunning(false);
      setWon(true);
    }
  };

  useEffect(() => {
    if (!user || !won) {
      return;
    }

    if (stoppedTime == null) {
      return;
    }

    if (!buildData) {
      triggerNotification("Failed to save time", "error", "Data not found");
      return;
    }

    let data = buildData;

    let string = "";
    for (let y = 0; y < data.length; y++) {
      for (let x = 0; x < data.length; x++) {
        if (data[y][x].state == "black") {
          continue;
        }

        string += data[y][x].answer;
      }
    }

    const simpleHash = generateSimpleHash(string);
    const currentDate = new Date();
    const formattedDate = formatDate(currentDate);

    let alreadyPlayed = false;

    getCompletedCrosswords(auth.currentUser, "full").then(
      (completed: string[]) => {
        if (completed.includes(simpleHash)) {
          alreadyPlayed = true;
          setAlreadyCompleted(true);
          return;
        } else {
          updateCompletedCrosswords(auth.currentUser, simpleHash, "full");
        }
      },
    );

    getHighScore(auth.currentUser, "full").then((score) => {
      if (
        !score ||
        score.time == undefined ||
        !score.date == undefined ||
        (stoppedTime < score.time && !alreadyPlayed)
      ) {
        setHighScore(auth.currentUser, stoppedTime, formattedDate, "full");
        setHighScoreTime(formatTime(stoppedTime));
        setHighScoreDate(formattedDate);
        return;
      } else {
        setHighScoreTime(formatTime(score.time));
        setHighScoreDate(score.date);
        return;
      }
    });
  }, [stoppedTime, user, won]);

  function detectWin(data: CrossWordBoxData[][]): boolean {
    for (let y = 0; y < data.length; y++) {
      for (let x = 0; x < data.length; x++) {
        if (data[y][x].state == "black") {
          continue;
        }

        if (data[y][x].guess != data[y][x].answer) {
          return false;
        }
      }
    }

    return true;
  }

  function findNextSelectionSpot(
    data: CrossWordBoxData[][],
    direction: "across" | "down",
    startX: number,
    startY: number,
  ): { x: number; y: number } {
    if (direction == "across") {
      for (let x = startX + 1; x < data.length; x++) {
        if (
          ((mode == "play" && data[startY][x].guess == "") ||
            (mode == "build" && data[startY][x].answer == "")) &&
          data[startY][x].state != "black"
        ) {
          return { x: x, y: startY };
        } else if (data[startY][x].state == "black") {
          return { x: x - 1, y: startY };
        }
      }
    } else {
      for (let y = startY + 1; y < data.length; y++) {
        if (
          ((data[y][startX].guess == "" && mode == "play") ||
            (mode == "build" && data[y][startX].answer == "")) &&
          data[y][startX].state != "black"
        ) {
          return { x: startX, y: y };
        } else if (data[y][startX].state == "black") {
          return { x: startX, y: y - 1 };
        }
      }
    }

    return { x: startX, y: startY };
  }

  const handleEnterForNumberPlace = () => {
    if (!buildData) {
      triggerNotification(
        "Failed to handle enter for number",
        "error",
        "Data not found",
      );
      return;
    }

    if (!currentEditDirection) {
      triggerNotification(
        "Failed to handle enter for number",
        "error",
        "Current edit direction not found",
      );
      return;
    }

    let tempData = buildData.map((row) => row.map((box) => ({ ...box })));

    tempData = setNumber(tempData);

    setBuildData(tempData);
  };

  const addNewHintToList = (direction: "across" | "down", number: number) => {
    if (!buildHints) {
      triggerNotification(
        "Failed to add new hint",
        "error",
        "Build Hints not found",
      );
      return;
    }

    let tempHints = buildHints;

    let hint: CrossWordHint = {
      number: number,
      hint: "",
    };

    if (direction === "across") {
      tempHints.across.push(hint);
      tempHints.across.sort((a, b) => a.number - b.number);
    } else {
      tempHints.down.push(hint);
      tempHints.down.sort((a, b) => a.number - b.number);
    }

    setBuildHints(tempHints);
  };

  const handleRightKey = () => {
    const location = currentSelectionNumberXY;
    if (location == null || location?.length != 2) {
      triggerNotification(
        "Failed to handle right key press",
        "error",
        "Location is either not found or incorrect",
      );
      return;
    }

    if (!buildData) {
      triggerNotification(
        "Failed to handle right key press",
        "error",
        "Data not found",
      );
      return;
    }

    let tempData = buildData.map((row) => row.map((box) => ({ ...box })));

    setCurrentEditDirection("across");
    setCurrentTrend("across");
    setHighlightMode("across");
    tempData = highlight(location[0], location[1], "across", true, tempData);

    setBuildData(tempData);
  };

  const handleDownKey = () => {
    const location = currentSelectionNumberXY;

    if (location == null || location?.length != 2) {
      triggerNotification(
        "Failed to handle right key press",
        "error",
        "Location is either not found or incorrect",
      );

      return;
    }

    if (!buildData) {
      triggerNotification(
        "Failed to handle down key press",
        "error",
        "Data not found",
      );
      return;
    }

    let tempData = buildData.map((row) => row.map((box) => ({ ...box })));

    setCurrentEditDirection("down");
    setCurrentTrend("down");
    setHighlightMode("down");
    tempData = highlight(location[0], location[1], "down", true, tempData);

    setBuildData(tempData);
  };

  const handleClickOnHint = (
    direction: "across" | "down",
    number: number,
    hint: string,
  ) => {
    if (!buildData) {
      triggerNotification("Failed to goto word", "error", "Data not found");
      return;
    }

    let tempData = buildData.map((row) => row.map((box) => ({ ...box })));

    if (mode == "play") {
      tempData = gotoWord(number, direction, tempData);
      setHintNumber(number);
      setHint(hint);
    } else {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (buildData[y][x].number == number) {
            setCurrentTrend(direction);
            setCurrentSelectionNumberXY([x, y]);
            tempData = highlight(x, y, direction, true, tempData);
            break;
          }
        }
      }

      activateHintEditPopup(direction, number, hint);
    }

    setBuildData(tempData);
  };

  const activateHintEditPopup = (
    direction: "down" | "across",
    number: number,
    hint: string,
  ) => {
    setHintNumber(number);
    setHintDirection(direction);
    setHint(hint);
    setShowHintCreationPopup(true);
  };

  const deactivateHintEditPopup = () => {
    setShowHintCreationPopup(false);
    setHintDirection(undefined);
    setHintNumber(undefined);
    setHint("");
  };

  const editHint = (event: any) => {
    setHint(event.target.value);
  };

  const saveEditHint = () => {
    if (!buildHints) {
      triggerNotification(
        "Failed to save hint",
        "error",
        "Build hints not found",
      );
      return;
    }

    if (!hintDirection) {
      triggerNotification(
        "Failed to save hint",
        "error",
        "Hint direction not found",
      );
      return;
    }

    let tempHints = buildHints;

    if (hintDirection == "across") {
      for (let i = 0; i < tempHints.across.length; i++) {
        if (tempHints.across[i].number == hintNumber) {
          tempHints.across[i].hint = hint;
          break;
        }
      }
    } else {
      for (let i = 0; i < tempHints.down.length; i++) {
        if (tempHints.down[i].number == hintNumber) {
          tempHints.down[i].hint = hint;
          break;
        }
      }
    }

    setBuildHints(tempHints);
    deactivateHintEditPopup();
  };

  function gotoWord(
    number: number,
    direction: "across" | "down",
    data: CrossWordBoxData[][],
  ): CrossWordBoxData[][] {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (data[y][x].number == number) {
          setCurrentTrend(direction);
          setCurrentSelectionNumberXY([x, y]);
          data = highlight(x, y, direction, true, data);
          break;
        }
      }
    }

    return data;
  }

  const updateCrossword = () => {
    let tempHints = buildHints;

    if (!tempHints) {
      triggerNotification(
        "Crossword update failed",
        "error",
        "Hints not found",
      );
      return;
    }

    if (tempHints.across.length == 0 && tempHints.down.length == 0) {
      triggerNotification(
        "Crossword update failed",
        "error",
        "Crossword must have at least one word",
      );
      return;
    }

    for (let i = 0; i < tempHints.across.length; i++) {
      if (tempHints.across[i].hint == "") {
        triggerNotification(
          "Crossword update failed",
          "error",
          "Hint missing hint",
        );
        return;
      }
    }

    for (let i = 0; i < tempHints.down.length; i++) {
      if (tempHints.down[i].hint == "") {
        triggerNotification(
          "Crossword update failed",
          "error",
          "Hint missing hint",
        );
        return;
      }
    }

    if (!buildData) {
      triggerNotification("Crossword update failed", "error", "Data not found");
      return;
    }

    let tempData = buildData.map((row) => row.map((box) => ({ ...box })));

    for (let y = 0; y < tempData.length; y++) {
      for (let x = 0; x < tempData[y].length; x++) {
        if (tempData[y][x].state != "black") {
          tempData[y][x].state = "normal";
        }

        if (
          tempData[y][x].belongsTo.length != 0 &&
          tempData[y][x].answer == ""
        ) {
          triggerNotification(
            "Crossword update failed",
            "error",
            "A square associated with a number is missing an answer",
          );
          return;
        }
      }
    }

    if (debug) {
      triggerNotification(
        "Crosssword does not update in debug mode",
        "warning",
        "Crossword would have updated",
      );
      return;
    }

    const currentDate = new Date();
    const formattedDate = formatDate(currentDate);

    const jsonDataString = JSON.stringify(tempData);
    const jsonHintString = JSON.stringify(tempHints);

    let crossword: Crossword = {
      data: jsonDataString,
      hints: jsonHintString,
      author: user.displayName,
      published: formattedDate,
    };

    const jsonCrosswordString = JSON.stringify(crossword);
    saveCrossword(jsonCrosswordString, "full");

    loadStringData(jsonCrosswordString);

    triggerNotification("Saved!", "success", "Successfully updated crossword");
  };

  const loadStringData = (data: string) => {
    let crossword = decodeJsonData(data);
    let crosswordData: CrossWordBoxData[][] = JSON.parse(crossword.data);
    let hintData: CrosswordHints = JSON.parse(crossword.hints);

    setFromDbData(crosswordData);
    setFromDbHints(hintData);
    setAuthor(crossword.author);
    setPublished(crossword.published);
    setBuildData(crosswordData);
    setBuildHints(hintData);

    setMode("play");
  };

  function determineAssociationColor(box: CrossWordBoxData) {
    if (box.state == "black") {
      return "";
    }

    // no data
    if (box.belongsTo.length == 0 && box.answer == "") {
      return "bg-red-200";
    }

    // half data
    if (
      (box.belongsTo.length == 0 && box.answer != "") ||
      (box.belongsTo.length != 0 && box.answer == "")
    ) {
      return "bg-orange-200";
    }

    // all data
    if (box.belongsTo.length != 0 && box.answer != "") {
      return "bg-green-200";
    }
  }
  return (
    <main className="w-5/6 ml-auto mr-auto">
      <h1 className="font-heading text-center mb-4 text-8xl max-sm:text-7xl max-xs:text-6xl">
        Crossword
      </h1>
      <section className="flex justify-center gap-2 max-xl:flex-col w-full">
        <div className="flex flex-col gap-2">
          <section className="flex gap-2 w-full">
            <div className="rounded bg-secondary-300 max-xs:p-2 w-full flex items-center justify-left">
              {isRunning == true && hint ? (
                <p className="pl-2">{`${hintNumber}. ${hint}`}</p>
              ) : (
                <div className="flex w-full justify-between items-center px-2">
                  <p>{`Crossword by ${author}`}</p>
                  <p>{`Published ${published}`}</p>
                </div>
              )}
            </div>
            <div className="rounded bg-secondary-300 p-5 max-xs:p-2 w-1/6 flex items-center justify-center">
              <Stopwatch
                start={isRunning}
                reset={isReset}
                onResetComplete={handleResetComplete}
                onStop={handleStopTime}
              />
            </div>
          </section>
          <section className="flex flex-col max-xl:items-center">
            {buildData?.map((row: CrossWordBoxData[], y) => (
              <div key={y} className="flex">
                {row.map((box: CrossWordBoxData, x) => (
                  <div
                    key={x}
                    onClick={() => takeAction(x, y)}
                    className={`w-[40px] h-[40px] max-md:w-[35px] max-md:h-[35px] max-sm:w-[25px] max-sm:h-[25px] max-xs:w-[20px] max-xs:h-[20px] border-[0.5px] border-secondary-900 cursor-pointer flex items-center justify-center relative 
                  ${y == 0 ? "border-t-2 border-t-black" : ""} ${
                    y == height - 1 ? "border-b-2 border-b-black" : ""
                  } ${x == 0 ? "border-l-2 border-l-black" : ""} ${
                    x == width - 1 ? "border-r-2 border-r-black" : ""
                  }
                  ${box.state == "highlighted" ? "bg-secondary-300" : ""} ${
                    box.state == "selected" ? "bg-primary-300" : null
                  } ${
                    box.state == "black" ? "bg-accent-900 cursor-default" : null
                  } ${
                    (showAssociations || debug) && mode == "build"
                      ? `${determineAssociationColor(box)}`
                      : ""
                  }`}
                  >
                    <p className="absolute text-sm top-[1px] right-1">
                      {mode == "build" && debug
                        ? `${
                            box.number != undefined
                              ? `${box.belongsTo.length == 1 ? "p" : "c"}`
                              : ""
                          }`
                        : ""}
                    </p>
                    <p className="absolute text-[0.7rem] max-sm:text-[0.5rem] top-[1px] left-1">
                      {box.number}
                    </p>
                    <p
                      className={`max-sm:text-[0.7rem] ${
                        (checked ||
                          (singleWordChecked &&
                            wordBoxes.boxes.some(
                              (wordBox) => wordBox.x === x && wordBox.y === y,
                            ))) &&
                        box.state != "black" &&
                        mode == "play"
                          ? `${
                              box.guess == box.answer
                                ? "text-green-700"
                                : "text-red-700"
                            }`
                          : ""
                      } `}
                    >{`${mode == "play" ? box.guess : box.answer} `}</p>
                    <p className="absolute text-sm bottom-[1px] left-1">
                      {mode == "build" && debug ? box.belongsTo.join(",") : ""}
                    </p>
                    <p className="absolute text-sm bottom-[1px] right-1">
                      {mode == "build" && debug
                        ? `${
                            box.next
                              ? `${box.next == "across" ? "a" : "d"}`
                              : ""
                          }`
                        : ""}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </section>
        </div>
        <section className="flex flex-col gap-2 w-full">
          {mode == "play" ? (
            <div className="flex gap-2">
              <Button
                onClick={() => setChecked(!checked)}
                title="Check Board"
                classModifier={`p-5 bg-secondary-400 hover:bg-secondary-500 ${
                  checked ? "bg-secondary-500" : ""
                }`}
              />
              <Button
                onClick={() => setSingleWordChecked(!singleWordChecked)}
                title="Check Word"
                classModifier={
                  singleWordChecked
                    ? "bg-secondary-500"
                    : "bg-secondary-400 hover:bg-secondary-500"
                }
              />
              <Button
                onClick={clearBoard}
                title="Clear Board"
                classModifier="bg-secondary-400 hover:bg-secondary-500"
              />
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={() => editModeSelector("editBlack")}
                title="Edit Black"
                classModifier={`p-5 ${
                  editMode == "editBlack"
                    ? "bg-secondary-500"
                    : "bg-secondary-400 hover:bg-secondary-500"
                }`}
              />
              <Button
                onClick={() => editModeSelector("placeNumbers")}
                title="Place Numbers"
                classModifier={`p-5 ${
                  editMode == "placeNumbers"
                    ? "bg-secondary-500"
                    : "bg-secondary-400 hover:bg-secondary-500"
                }`}
              />
              <Button
                onClick={() => editModeSelector("removeNumbers")}
                title="Remove Numbers"
                classModifier={`p-5 ${
                  editMode == "removeNumbers"
                    ? "bg-secondary-500"
                    : "bg-secondary-400 hover:bg-secondary-500"
                }`}
              />
              <Button
                onClick={() => editModeSelector("placeLetters")}
                title="Place Letters"
                classModifier={`p-5 ${
                  editMode == "placeLetters"
                    ? "bg-secondary-500"
                    : "bg-secondary-400 hover:bg-secondary-500"
                }`}
              />
            </div>
          )}
          {showHintCreationPopup ? (
            <section>
              <input
                type="text"
                placeholder={`${hintNumber}. Edit Hint`}
                className="bg-accent-200 p-2 rounded w-full placeholder:text-secondary-900 focus:outline-none"
                value={hint}
                onChange={(event) => editHint(event)}
              />
              <ConnectedButton
                onClickLeft={saveEditHint}
                onClickRight={deactivateHintEditPopup}
                leftTitle="Save"
                rightTitle="Cancel"
                containerClassModifier="mt-2"
                leftClassModifier="bg-green-400 hover:bg-green-500"
                rightClassModifier="bg-secondary-400 hover:bg-secondary-500"
              />
            </section>
          ) : null}
          <section className="flex border-black border-t-2 gap-2 max-h-80 justify-between max-sm:flex-col">
            <div className="w-full">
              <p className="font-bold text-xl text-center">Down</p>
              {buildHints ? (
                <div className="flex flex-col gap-2 overflow-scroll max-h-72">
                  {buildHints.down.map((hint: CrossWordHint, key) => (
                    <p
                      key={key}
                      onClick={() =>
                        handleClickOnHint("down", hint.number, hint.hint)
                      }
                      className="hover:bg-secondary-400 rounded p-2 transition-all duration-200 ease-out cursor-pointer"
                    >{`${hint.number}. ${
                      hint.hint == "" ? "Edit Hint" : hint.hint
                    }`}</p>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="max-sm:hidden h-[17.5rem] mt-1 border border-black block"></div>
            <div className="w-full">
              <p className="font-bold text-xl text-center">Across</p>
              {buildHints ? (
                <div className="flex flex-col gap-2 max-h-72 overflow-scroll">
                  {buildHints.across.map((hint: CrossWordHint, key) => (
                    <p
                      key={key}
                      onClick={() =>
                        handleClickOnHint("across", hint.number, hint.hint)
                      }
                      className="hover:bg-secondary-400 rounded p-2 transition-all duration-200 ease-out cursor-pointer"
                    >{`${hint.number}. ${
                      hint.hint == "" ? "Edit Hint" : hint.hint
                    }`}</p>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
          {user && (isMaksim || isAdmin || isHelper) ? (
            <ConnectedButton
              onClickLeft={toggleMode}
              onClickRight={toggleMode}
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
            />
          ) : null}
          {mode === "build" ? (
            <>
              <section>
                <p className="mb-2 text-red-500 text-center italic">
                  There is no undo. I will not make one. Dont mess up.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={fillNoneLettersBlack}
                    title="Blackout"
                    classModifier="bg-secondary-400 hover:bg-secondary-500"
                  />
                  <Button
                    onClick={fillBlackEmpty}
                    title="Whiteout"
                    classModifier="bg-secondary-400 hover:bg-secondary-500"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    onClick={clearLetters}
                    title="Clear Letters"
                    classModifier="bg-secondary-400 hover:bg-secondary-500"
                  />
                  <Button
                    onClick={clearAssociations}
                    title="Clear Numbers"
                    classModifier="bg-secondary-400 hover:bg-secondary-500"
                  />
                </div>
                <div className="mt-2 flex flex-col gap-2">
                  <Button
                    onClick={() => setShowAssociations(!showAssociations)}
                    title="Toggle Associations"
                    classModifier={
                      showAssociations
                        ? "bg-secondary-500"
                        : "bg-secondary-400 hover:bg-secondary-500"
                    }
                  />
                  <Button
                    onClick={() => setDebug(!debug)}
                    title="Debug"
                    classModifier={
                      showAssociations
                        ? "bg-secondary-500"
                        : "bg-secondary-400 hover:bg-secondary-500"
                    }
                  />
                </div>
              </section>
              <section className="flex gap-2 items-center justify-between">
                <Button
                  onClick={cancelBuildWorkflow}
                  title="Cancel"
                  classModifier="p-5 bg-red-500 hover:bg-red-600"
                />
                <Button
                  onClick={updateCrossword}
                  title="Update"
                  classModifier="p-5 bg-secondary-400 hover:bg-secondary-500"
                />
              </section>
            </>
          ) : null}
        </section>
      </section>
      {won ? (
        <section className="fixed flex flex-col items-center justify-center left-0 top-0 w-full h-full bg-accent-900 bg-opacity-50">
          <div className="p-10 bg-background-50 rounded-xl w-3/6">
            <h2 className="font-heading text-7xl mb-1 text-center">
              Congratulations
            </h2>
            <h2 className="font-heading text-7xl mb-10 text-center">
              You Won!
            </h2>
            <div className="flex gap-2 justify-center items-center">
              <p className="text-2xl">
                Completion time:{" "}
                {stoppedTime !== null
                  ? formatTime(stoppedTime)
                  : "Failed to calculate time"}
              </p>
              <p className={`text-2xl ${!user ? "hidden" : ""}`}>
                Best Time: {highScoreTime}
              </p>
            </div>
            <p className={`${alreadyCompleted ? "text-center" : "hidden"}`}>
              You have already played this crossword, your score is invalid
            </p>
          </div>
          <div className="flex gap-2 mt-2 w-3/6">
            <Button
              onClick={playAgain}
              title="Play Again"
              classModifier="p-5 bg-secondary-400 hover:bg-secondary-500"
            />
            <Button
              onClick={() => router.push("/")}
              title="Browse Games"
              classModifier="p-5 bg-secondary-400 hover:bg-secondary-500"
            />
          </div>
        </section>
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
    </main>
  );
}
