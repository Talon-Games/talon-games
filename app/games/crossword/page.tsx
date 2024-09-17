"use client";
// To the person who next works on this, im sorry
import updateCompletedCrosswords from "@/firebase/db/games/crossword/updateCompletedCrosswords";
import clearHighlightAndSelection from "@/utils/games/crossword/clearHighlightAndSelection";
import getCompletedCrosswords from "@/firebase/db/games/crossword/getCompletedCrosswords";
import findNextSelectionSpot from "@/utils/games/crossword/findNextSelectionSpot";
import getBoxesInDirection from "@/utils/games/crossword/getBoxesInDirection";
import generateNewTable from "@/utils/games/crossword/generateNewTable";
import saveCrossword from "@/firebase/db/games/crossword/saveCrossword";
import getHighScore from "@/firebase/db/games/crossword/getHighScore";
import setHighScore from "@/firebase/db/games/crossword/setHighScore";
import getCrossword from "@/firebase/db/games/crossword/getCrossword";
import decodeJsonData from "@/utils/games/crossword/decodeJsonData";
import ConnectedButton from "@/components/general/connectedButtons";
import selectCurrent from "@/utils/games/crossword/selectCurrent";
import initNewHints from "@/utils/games/crossword/initNewHints";
import Notification from "@/components/general/notification";
import FullGrid from "@/components/games/crossword/fullGrid";
import MiniGrid from "@/components/games/crossword/miniGrid";
import { useAuthContext } from "@/lib/contexts/authContext";
import highlight from "@/utils/games/crossword/highlight";
import generateSimpleHash from "@/utils/games/simpleHash";
import detectWin from "@/utils/games/crossword/detectWin";
import Stopwatch from "@/components/games/stopwatch";
import ToolTip from "@/components/general/tooltip";
import Keyboard from "@/components/games/keyboard";
import formatTime from "@/utils/games/formatTime";
import Button from "@/components/general/button";
import getRoles from "@/firebase/db/getRoles";
import { useRouter } from "next/navigation";
import formatDate from "@/utils/formatDate";
import { useState, useEffect } from "react";
import { auth } from "@/firebase/config";
import isMobile from "@/utils/isMobile";

export type Crossword = {
  data: string; // as json
  hints: string; // as json
  realAuthor: string; // google user whos account was used
  author: string; // the person given credit
  name: string;
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
  const [crosswordSize, setCrosswordSize] = useState<{
    width: number;
    height: number;
    size: "mini" | "full";
  }>({ width: 12, height: 12, size: "full" });

  const router = useRouter();
  const { user } = useAuthContext() as { user: any };
  const [keyStats, setKeyStats] = useState<{
    [key: string]: "correct" | "incorrect" | "default";
  }>({});

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
  const [debug, setDebug] = useState(false);

  const [author, setAuthor] = useState("");
  const [published, setPublished] = useState("");

  const [mode, setMode] = useState<"play" | "build">("play");
  const [highlightMode, setHighlightMode] = useState<
    "down" | "across" | "both"
  >("both");
  const [currentEditNumber, setCurrentEditNumber] = useState(1);
  const [currentEditDirection, setCurrentEditDirection] = useState<
    "down" | "across"
  >();
  const [currentSelectionNumberXY, setCurrentSelectionNumberXY] =
    useState<[number, number]>();
  const [currentTrend, setCurrentTrend] = useState<
    "down" | "across" | undefined
  >(undefined);
  const [wordBoxes, setWordBoxes] = useState<{
    num: number;
    boxes: { x: number; y: number }[];
  }>({ num: 0, boxes: [] });
  const [boxesToCheck, setBoxesToCheck] = useState<{ x: number; y: number }[]>(
    [],
  );
  const [placeBlack, setPlaceBlack] = useState(false);

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

  const [mobileDevice, setMobileDevice] = useState(false);

  const [importPopup, setImportPopup] = useState(false);
  const [importedData, setImporteData] = useState("");

  const [publishPopup, setPublishPopup] = useState(false);
  const [crosswordName, setCrosswordName] = useState("");
  const [crosswordAuthor, setCrosswordAuthor] = useState("");
  const [saveToArchive, setSaveToArchive] = useState(true);

  const [helpPopup, setHelpPopup] = useState(false);

  const [currentView, setCurrentView] = useState<"play" | "archive">("play");

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

  useEffect(() => {
    const mobile = isMobile();

    setMobileDevice(mobile);

    if (user && !mobile) {
      getRoles(auth.currentUser).then(
        (roles: { isMaksim: boolean; isAdmin: boolean; isHelper: boolean }) => {
          setIsMaksim(roles.isMaksim);
          setIsAdmin(roles.isAdmin);
          setIsHelper(roles.isHelper);
        },
      );
    }
  }, [user]);

  const triggerNotification = (
    title: string,
    type: "success" | "error" | "warning",
    message: string,
    showInPlay?: boolean,
  ) => {
    if (mode == "play" && !showInPlay) return;
    setNotification(true);
    setNotificationTitle(title);
    setNotificationType(type);
    setNotificationMessage(message);
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    let type = url.searchParams.get("type");

    let size: "full" | "mini" = "full";
    if (type == "mini") {
      size = "mini";
    }

    if (size == "mini") {
      setCrosswordSize({ width: 5, height: 5, size: "mini" });
    }

    getCrossword(size).then((data) => {
      loadStringData(data);
    });
  }, []);

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
    setHighlightMode("both");
    setCurrentEditNumber(1);
    let table = generateNewTable(crosswordSize.width, crosswordSize.height);
    let newHints = initNewHints();

    setBuildHints(newHints);
    setBuildData(table);
    setMode("build");
  };

  const cancelBuildWorkflow = () => {
    setHighlightMode("both");
    setCurrentEditNumber(1);
    setShowHintCreationPopup(false);
    setPlaceBlack(false);

    let table = generateNewTable(crosswordSize.width, crosswordSize.height);
    let newHints = initNewHints();

    setBuildHints(newHints);
    setBuildData(table);
  };

  function setNumber(
    direction: "down" | "across",
    startX: number,
    startY: number,
    data: CrossWordBoxData[][],
  ): CrossWordBoxData[][] {
    if (data[startY][startX].state == "black") return data;

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
      for (let x = startX; x < crosswordSize.width; x++) {
        const getNextBlock = () => {
          if (x + 1 != crosswordSize.width) {
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
        if (!data[startY][x].number && !data[startY][x].next) {
          data[startY][x].next = currentState.direction;
        }

        if (nextBlock == undefined || nextBlock.state == "black") {
          break;
        }
      }

      data[startY][startX].next = "across";
    } else {
      for (let y = startY; y < crosswordSize.height; y++) {
        const getNextBlock = () => {
          if (y + 1 != crosswordSize.height) {
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

        if (!data[y][startX].number && !data[y][startX].next) {
          data[y][startX].next = currentState.direction;
        }
        if (nextBlock == undefined || nextBlock.state == "black") {
          break;
        }
      }

      data[startY][startX].next = "down";
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

  const startNumberRemover = () => {
    if (!buildData) {
      triggerNotification("Failed to toggle black", "error", "Data not found");
      return;
    }

    if (!currentSelectionNumberXY) {
      triggerNotification(
        "Failed to toggle black",
        "error",
        "Current location not found",
      );
      return;
    }

    const data = buildData.map((row) => [...row]);
    let x = currentSelectionNumberXY[0];
    let y = currentSelectionNumberXY[1];

    let deletionNumber = data[y][x].number;

    if (!deletionNumber) {
      return data;
    }

    data[y][x].number = undefined;
    let downShifted = downShift(data, deletionNumber);

    downShifted = clearHighlightAndSelection(downShifted);
    if (currentEditNumber != 1) {
      setCurrentEditNumber(currentEditNumber - 1);
    }

    setBuildData([...downShifted]);
  };

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
      setCurrentSelectionNumberXY(undefined);
    }

    return data;
  }

  function downShift(
    data: CrossWordBoxData[][],
    deletionNumber: number,
  ): CrossWordBoxData[][] {
    for (let y = 0; y < crosswordSize.height; y++) {
      for (let x = 0; x < crosswordSize.width; x++) {
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
    if (!buildData) {
      triggerNotification("Failed take action", "error", "Data not found");
      return;
    }

    if (mode == "play" && !isRunning && !won) {
      setIsRunning(true);
    }

    let tempData = buildData.map((row) => row.map((box) => ({ ...box })));
    tempData = clearHighlightAndSelection(tempData);
    if (!placeBlack) {
      tempData = startLetterPlacer(x, y, tempData);
    } else {
      tempData = toggleBlack(x, y, tempData);
    }
    setBuildData(tempData);
  };

  function startLetterPlacer(
    x: number,
    y: number,
    data: CrossWordBoxData[][],
  ): CrossWordBoxData[][] {
    if (data[y][x].state == "black" && mode == "play") {
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
        if (currentTrend == "across" && data[y + 1][x].state != "black") {
          data = highlight(x, y, "down", mode == "play" ? false : true, data);
          const boxes = getBoxesInDirection(x, y, "down", data);
          updateHintFromWordBoxes(boxes, "down");
          setWordBoxes(boxes);
          setCurrentTrend("down");
          setCurrentEditDirection("down");
        } else if (currentTrend == "down" && data[y][x + 1].state != "black") {
          data = highlight(x, y, "across", mode == "play" ? false : true, data);
          const boxes = getBoxesInDirection(x, y, "across", data);
          updateHintFromWordBoxes(boxes, "across");
          setWordBoxes(boxes);
          setCurrentTrend("across");
          setCurrentEditDirection("across");
        } else {
          const boxes = getBoxesInDirection(x, y, next, data);
          updateHintFromWordBoxes(boxes, next);
          setWordBoxes(boxes);
          setCurrentTrend(data[y][x].next);
          setCurrentEditDirection(data[y][x].next);
          data = highlight(x, y, next, mode == "play" ? false : true, data);
        }
      } else {
        const boxes = getBoxesInDirection(x, y, next, data);
        updateHintFromWordBoxes(boxes, next);
        setWordBoxes(boxes);
        setCurrentTrend(data[y][x].next);
        setCurrentEditDirection(data[y][x].next);
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
    if (!buildHints) {
      return;
    }

    setHintDirection(direction);
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showHintCreationPopup || importPopup || helpPopup || publishPopup)
        return;
      const key = event.key;

      if (key >= "a" && key <= "z") {
        handleKeyPressForLetters(key.toUpperCase());
      }

      switch (key) {
        case "ArrowRight":
          event.preventDefault();
          handleRightKey();
          break;
        case "ArrowDown":
          event.preventDefault();
          handleDownKey();
          break;
        case "Enter":
          if (mode == "play") return;
          event.preventDefault();
          handleEnterForNumberPlace();
          break;
        case "Backspace":
          handleBackspaceForLetters();
          break;
        case " ":
          if (mode == "play") return;
          event.preventDefault();
          setPlaceBlack(!placeBlack);
          break;
        case ".":
          if (mode == "play") return;
          event.preventDefault();
          openHintEditorForCurrentWord();
          break;
        case "Escape":
          if (mode == "play") return;
          event.preventDefault();
          startNumberRemover();
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
    showHintCreationPopup,
    importPopup,
    currentSelectionNumberXY,
    highlightMode,
    buildData,
    hintNumber,
    boxesToCheck,
    wordBoxes,
    crosswordSize,
    helpPopup,
    publishPopup,
  ]);

  const openHintEditorForCurrentWord = () => {
    if (!currentTrend || !buildHints) return;
    let number = wordBoxes.num;

    if (currentTrend == "down") {
      for (let i = 0; i < buildHints.down.length; i++) {
        if (buildHints.down[i].number == number) {
          setHint(buildHints.down[i].hint);
          break;
        }
      }
    } else {
      for (let i = 0; i < buildHints.across.length; i++) {
        if (buildHints.across[i].number == number) {
          setHint(buildHints.across[i].hint);
          break;
        }
      }
    }

    setHintNumber(number);
    setHintDirection(currentTrend);
    setShowHintCreationPopup(true);
  };

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
      let boxes: { x: number; y: number }[] = [...boxesToCheck];
      boxes = boxes.filter((box) => box.x != startX || box.y != startY);
      setBoxesToCheck([...boxes]);
      tempData[startY][startX].guess = "";
    } else {
      tempData[startY][startX].answer = "";
    }
    // move the selector back
    if (trend) {
      if (trend == "across" && startX - 1 >= 0) {
        if (tempData[startY][startX - 1].state == "black") {
          setBuildData(tempData);
          return;
        }

        tempData[startY][startX].state = "highlighted";
        tempData[startY][startX - 1].state = "selected";
        setCurrentSelectionNumberXY([startX - 1, startY]);
      } else if (trend == "down" && startY - 1 >= 0) {
        if (tempData[startY - 1][startX].state == "black") {
          setBuildData(tempData);
          return;
        }

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
      let boxes: { x: number; y: number }[] = [...boxesToCheck];
      boxes = boxes.filter(
        (box) => box.x != location[0] || box.y != location[1],
      );
      setBoxesToCheck([...boxes]);
    } else {
      tempData[location[1]][location[0]].answer = key;
    }

    if (currentTrend) {
      if (
        currentTrend == "across" &&
        location[0] + 1 != crosswordSize.width &&
        tempData[location[1]][location[0] + 1].state != "black"
      ) {
        tempData[location[1]][location[0]].state = "highlighted";
        let next = findNextSelectionSpot(
          tempData,
          "across",
          mode,
          location[0],
          location[1],
        );
        tempData[next.y][next.x].state = "selected";
        setCurrentSelectionNumberXY([next.x, next.y]);
      } else if (
        currentTrend == "down" &&
        location[1] + 1 != crosswordSize.height &&
        tempData[location[1] + 1][location[0]].state != "black"
      ) {
        tempData[location[1]][location[0]].state = "highlighted";
        let next = findNextSelectionSpot(
          tempData,
          "down",
          mode,
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

    getCompletedCrosswords(auth.currentUser, crosswordSize.size).then(
      (completed: string[]) => {
        if (completed.includes(simpleHash)) {
          alreadyPlayed = true;
          setAlreadyCompleted(true);
          return;
        } else {
          updateCompletedCrosswords(
            auth.currentUser,
            simpleHash,
            crosswordSize.size,
          );
        }
      },
    );

    getHighScore(auth.currentUser, crosswordSize.size).then((score) => {
      if (
        !score ||
        score.time == undefined ||
        !score.date == undefined ||
        (stoppedTime < score.time && !alreadyPlayed)
      ) {
        setHighScore(
          auth.currentUser,
          stoppedTime,
          formattedDate,
          crosswordSize.size,
        );
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

    if (!currentSelectionNumberXY) {
      triggerNotification(
        "Failed to hanlde enter for number",
        "error",
        "Location not found",
      );
      return;
    }
    let tempData = buildData.map((row) => row.map((box) => ({ ...box })));

    tempData = setNumber(
      currentEditDirection,
      currentSelectionNumberXY[0],
      currentSelectionNumberXY[1],
      tempData,
    );

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

    if (
      location[0] + 1 > tempData.length ||
      tempData[location[1]][location[0] + 1].state == "black"
    ) {
      return;
    }

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

    if (
      location[1] + 1 > tempData.length ||
      tempData[location[1] + 1][location[0]].state == "black"
    ) {
      return;
    }

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
      setHintDirection(direction);
      setHintNumber(number);
      setHint(hint);
    } else {
      for (let y = 0; y < crosswordSize.height; y++) {
        for (let x = 0; x < crosswordSize.width; x++) {
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
    for (let y = 0; y < crosswordSize.height; y++) {
      for (let x = 0; x < crosswordSize.width; x++) {
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
    setPublishPopup(false);

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
      realAuthor: user.displayName,
      author: crosswordAuthor,
      name: crosswordName,
      published: formattedDate,
    };

    const jsonCrosswordString = JSON.stringify(crossword);
    saveCrossword(jsonCrosswordString, crosswordSize.size, saveToArchive);

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

  const checkWord = () => {
    let boxes: { x: number; y: number }[] = [...boxesToCheck];
    wordBoxes.boxes.map((box) => boxes.push(box));
    setBoxesToCheck([...boxes]);
  };

  const checkBoard = () => {
    if (!buildData) {
      triggerNotification("Failed to check board", "error", "Data not found");
      return;
    }
    let boxes: { x: number; y: number }[] = [...boxesToCheck];

    for (let y = 0; y < buildData.length; y++) {
      for (let x = 0; x < buildData.length; x++) {
        if (buildData[y][x].state == "black") {
          continue;
        }

        boxes.push({ x: x, y: y });
      }
    }

    setBoxesToCheck([...boxes]);
  };

  const exportData = () => {
    if (!buildData) {
      triggerNotification("Failed to export data", "error", "Data not found");
      return;
    }

    if (!buildHints) {
      triggerNotification("Failed to export data", "error", "Hints not found");
    }

    let data = buildData.map((row) => row.map((box) => ({ ...box })));
    let hints = buildHints;

    const currentDate = new Date();
    const formattedDate = formatDate(currentDate);

    const jsonDataString = JSON.stringify(data);
    const jsonHintString = JSON.stringify(hints);

    let crossword: Crossword = {
      data: jsonDataString,
      hints: jsonHintString,
      author: user.displayName,
      realAuthor: user.displayName,
      name: "Exported Crossword",
      published: formattedDate,
    };

    const jsonCrosswordString = JSON.stringify(crossword);

    navigator.clipboard
      .writeText(jsonCrosswordString)
      .then(() => {
        triggerNotification(
          "Exported data!",
          "success",
          "Saved data to clipboard",
        );
      })
      .catch((err) => {
        triggerNotification(
          "Failed to export data",
          "error",
          "Failed to copy to clipboard",
        );
      });
  };

  const importData = () => {
    if (importedData === "") {
      triggerNotification(
        "Failed to import data",
        "error",
        "Data can't be empty",
      );
      return;
    }

    let crossword: Crossword;

    try {
      crossword = decodeJsonData(importedData);
    } catch (e) {
      triggerNotification(
        "Failed to import data",
        "error",
        "Invalid JSON format",
      );
      return;
    }

    let crosswordData: CrossWordBoxData[][];
    let hintData: CrosswordHints;

    try {
      crosswordData = JSON.parse(crossword.data);
      if (
        !Array.isArray(crosswordData) ||
        !crosswordData.every((row) => Array.isArray(row))
      ) {
        throw new Error("Invalid crossword data structure");
      }
      crosswordData.forEach((row) => {
        row.forEach((box) => {
          if (
            typeof box.answer !== "string" ||
            typeof box.guess !== "string" ||
            typeof box.state !== "string"
          ) {
            throw new Error("Invalid CrossWordBoxData structure");
          }
          if (box.number !== undefined && typeof box.number !== "number") {
            throw new Error("Invalid number type in CrossWordBoxData");
          }
          if (
            !Array.isArray(box.belongsTo) ||
            !box.belongsTo.every((num) => typeof num === "number")
          ) {
            throw new Error("Invalid belongsTo array in CrossWordBoxData");
          }
          if (
            box.next !== undefined &&
            box.next !== "down" &&
            box.next !== "across"
          ) {
            throw new Error("Invalid next direction in CrossWordBoxData");
          }
        });
      });
    } catch (e: any) {
      triggerNotification("Failed to import data", "error", e.message);
      return;
    }

    try {
      hintData = JSON.parse(crossword.hints);
      if (typeof hintData !== "object" || !hintData.across || !hintData.down) {
        throw new Error("Invalid hints data structure");
      }

      (["across", "down"] as const).forEach((direction) => {
        hintData[direction].forEach((hint: CrossWordHint) => {
          if (
            typeof hint.hint !== "string" ||
            typeof hint.number !== "number"
          ) {
            throw new Error("Invalid CrossWordHint structure");
          }
        });
      });
    } catch (e: any) {
      triggerNotification("Failed to import data", "error", e.message);
      return;
    }

    let highest = 1;

    for (let y = 0; y < crosswordData.length; y++) {
      for (let x = 0; x < crosswordData.length; x++) {
        let number = crosswordData[y][x].number;

        if (!number) {
          continue;
        }

        if (number > highest) {
          highest = number;
        }
      }
    }

    setCurrentEditNumber(highest + 1);

    setBuildData(crosswordData);
    setBuildHints(hintData);
    setImportPopup(false);
    setImporteData("");
    triggerNotification("Imported data!", "success", "Imported crossword data");
  };

  const loadCurrent = () => {
    if (!fromDbData) {
      triggerNotification(
        "Failed to load current",
        "error",
        "DB data not found",
      );
      return;
    }

    setBuildData(fromDbData);

    let highest = 1;

    for (let y = 0; y < fromDbData.length; y++) {
      for (let x = 0; x < fromDbData.length; x++) {
        let number = fromDbData[y][x].number;

        if (!number) {
          continue;
        }

        if (number > highest) {
          highest = number;
        }
      }
    }

    setCurrentEditNumber(highest + 1);
    setBuildHints(fromDbHints);
  };

  const onChar = (key: string) => {
    handleKeyPressForLetters(key.toUpperCase());
  };

  const onDelete = () => {
    handleBackspaceForLetters();
  };

  const onEnter = () => {
    checkWord();
  };

  const showPublishPopup = () => {
    setCrosswordName("");
    setCrosswordAuthor(user.displayName);
    setPublishPopup(true);
  };

  const switchView = () => {
    if (currentView == "play") {
      /**
       *  On the first switch to archive, load all of the archives
       * */
      setCurrentView("archive");
    } else {
      setCurrentView("play");
    }
  };

  return (
    <main className="w-9/12 ml-auto mr-auto max-sm:w-11/12">
      <h1 className="font-heading text-center mb-4 text-8xl max-sm:text-7xl max-xs:text-6xl">
        {crosswordSize.size == "full" ? "Crossword" : "Mini Crossword"}
      </h1>
      {/*TOOD: normal play and archive toggle*/}
      <ConnectedButton
        onClickLeft={switchView}
        onClickRight={switchView}
        leftStyle="normal"
        rightStyle="normal"
        leftTitle="Todays Crossword"
        rightTitle="Crossword Archives"
        containerClassModifier="mb-2 px-4"
        leftClassModifier={
          currentView == "play"
            ? "bg-secondary-500 border-r-2 border-secondary-400"
            : "bg-secondary-400 hover:bg-secondary-500"
        }
        rightClassModifier={
          currentView == "archive"
            ? "bg-secondary-500 border-l-2 border-secondary-400"
            : "bg-secondary-400 hover:bg-secondary-500"
        }
      />
      <section className="flex justify-center gap-2 max-xl:flex-col w-full">
        <div className="flex flex-col gap-2">
          {mode == "play" ? (
            <section className="flex gap-2 w-full">
              <Button onClick={checkBoard} title="Check Board" style="normal" />
              <Button onClick={checkWord} title="Check Word" style="normal" />
              <Button onClick={clearBoard} title="Clear Board" style="normal" />
            </section>
          ) : null}
          {crosswordSize.size == "full" ? (
            <FullGrid
              data={buildData}
              mode={mode}
              debug={debug}
              width={crosswordSize.width}
              height={crosswordSize.height}
              determineAssociationColor={determineAssociationColor}
              takeAction={takeAction}
              boxesToCheck={boxesToCheck}
            />
          ) : (
            <MiniGrid
              data={buildData}
              mode={mode}
              debug={debug}
              width={crosswordSize.width}
              height={crosswordSize.height}
              determineAssociationColor={determineAssociationColor}
              takeAction={takeAction}
              boxesToCheck={boxesToCheck}
            />
          )}
          <div className="rounded justify-between -mt-2 w-full flex items-center">
            <p className="text-center">{`Crossword by ${author}`}</p>
            <p className="text-center">{`Published ${published}`}</p>
          </div>
        </div>
        {mode == "build" ? (
          <section className="flex flex-col gap-2 max-xl:flex-row">
            <ToolTip content="Clear Board" delay={20}>
              <div
                className="flex items-center justify-center cursor-pointer bg-secondary-400 hover:bg-secondary-500 transition-all duration-200 ease-in-out p-2 rounded"
                onClick={cancelBuildWorkflow}
              >
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 1920 1920"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M954.64 826.418 426.667 298.445 298.445 426.667 826.418 954.64l-527.973 527.973 128.222 128.222 527.973-527.973 527.973 527.973 128.222-128.222-527.973-527.973 527.973-527.973-128.222-128.222z" />
                </svg>{" "}
              </div>
            </ToolTip>
            <ToolTip content="Blackout" delay={20}>
              <div
                className="flex items-center justify-center cursor-pointer bg-secondary-400 hover:bg-secondary-500 transition-all duration-200 ease-in-out p-2 rounded"
                onClick={fillNoneLettersBlack}
              >
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 50 50"
                  version="1.2"
                  baseProfile="tiny"
                  xmlns="http://www.w3.org/2000/svg"
                  overflow="inherit"
                >
                  <path d="M1 1h48v48h-48z" />
                </svg>{" "}
              </div>
            </ToolTip>
            <ToolTip content="Whiteout" delay={20}>
              <div
                className="flex items-center justify-center cursor-pointer bg-secondary-400 hover:bg-secondary-500 transition-all duration-200 ease-in-out p-2 rounded"
                onClick={fillBlackEmpty}
              >
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 15 15"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M1 1h13v13H1zm1 1v11h11V2z"
                    fill="#000"
                  />
                </svg>{" "}
              </div>
            </ToolTip>
            <ToolTip content="Load Current" delay={20}>
              <div
                className="flex items-center justify-center cursor-pointer bg-secondary-400 hover:bg-secondary-500 transition-all duration-200 ease-in-out p-2 rounded"
                onClick={loadCurrent}
              >
                <svg
                  height="30"
                  width="30"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 24H0V0h14.41L20 5.59v4.38h-2V8h-6V2H2v20h18zM14 6h3.59L14 2.41zm-3 10 4.71-4.71 1.41 1.41-2.29 2.3h8.59v2h-8.59l2.29 2.29-1.41 1.41z" />
                </svg>{" "}
              </div>
            </ToolTip>
            <ToolTip content="Debug" delay={20}>
              <div
                className={`flex items-center justify-center cursor-pointer bg-secondary-400 hover:bg-secondary-500 transition-all duration-200 ease-in-out p-2 rounded ${
                  debug ? "bg-secondary-500" : ""
                }`}
                onClick={() => setDebug(!debug)}
              >
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="m3.463 12.86-.005-.07zm7.264.69-3.034-3.049 1.014-1.014 3.209 3.225 3.163-3.163 1.014 1.014-3.034 3.034 3.034 3.05-1.014 1.014-3.209-3.225L8.707 17.6l-1.014-1.014 3.034-3.034z" />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M16.933 5.003V6h1.345l2.843-2.842 1.014 1.014-2.692 2.691.033.085a13.8 13.8 0 0 1 .885 4.912q0 .503-.034.995l-.005.075h3.54v1.434h-3.72l-.01.058c-.303 1.653-.891 3.16-1.692 4.429l-.06.094 3.423 3.44-1.017 1.012-3.274-3.29-.099.11c-1.479 1.654-3.395 2.646-5.483 2.646-2.12 0-4.063-1.023-5.552-2.723l-.098-.113-3.209 3.208-1.014-1.014 3.366-3.365-.059-.095c-.772-1.25-1.34-2.725-1.636-4.34l-.01-.057H0V12.93h3.538l-.005-.075a14 14 0 0 1-.034-.995c0-1.743.31-3.39.863-4.854l.032-.084-2.762-2.776L2.65 3.135 5.5 6h1.427v-.997a5.003 5.003 0 0 1 10.006 0m-8.572 0V6H15.5v-.997a3.569 3.569 0 0 0-7.138 0zm9.8 2.522-.034-.09H5.733l-.034.09a12.3 12.3 0 0 0-.766 4.335c0 2.76.862 5.201 2.184 6.92 1.32 1.716 3.036 2.649 4.813 2.649s3.492-.933 4.813-2.65c1.322-1.718 2.184-4.16 2.184-6.919 0-1.574-.28-3.044-.766-4.335"
                  />
                </svg>{" "}
              </div>
            </ToolTip>
            <ToolTip content="Export" delay={20}>
              <div
                className="flex items-center justify-center cursor-pointer bg-secondary-400 hover:bg-secondary-500 transition-all duration-200 ease-in-out p-2 rounded"
                onClick={exportData}
              >
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 15 15"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M7.818 1.182a.45.45 0 0 0-.636 0l-3 3a.45.45 0 1 0 .636.636L7.05 2.586V9.5a.45.45 0 1 0 .9 0V2.586l2.232 2.232a.45.45 0 1 0 .636-.636zM2.5 10a.5.5 0 0 1 .5.5V12c0 .554.446 1 .996 1h7.005A1 1 0 0 0 12 12v-1.5a.5.5 0 1 1 1 0V12a2 2 0 0 1-1.999 2H3.996A1.997 1.997 0 0 1 2 12v-1.5a.5.5 0 0 1 .5-.5"
                    fill="#000"
                  />
                </svg>
              </div>
            </ToolTip>
            <ToolTip content="Import" delay={20}>
              <div
                className="flex items-center justify-center cursor-pointer bg-secondary-400 hover:bg-secondary-500 transition-all duration-200 ease-in-out p-2 rounded"
                onClick={() => setImportPopup(true)}
              >
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 15 15"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M7.5 1.05a.45.45 0 0 1 .45.45v6.914l2.232-2.232a.45.45 0 1 1 .636.636l-3 3a.45.45 0 0 1-.636 0l-3-3a.45.45 0 1 1 .636-.636L7.05 8.414V1.5a.45.45 0 0 1 .45-.45M2.5 10a.5.5 0 0 1 .5.5V12c0 .554.446 1 .996 1h7.005A1 1 0 0 0 12 12v-1.5a.5.5 0 0 1 1 0V12a2 2 0 0 1-1.999 2H3.996A1.997 1.997 0 0 1 2 12v-1.5a.5.5 0 0 1 .5-.5"
                    fill="#000"
                  />
                </svg>
              </div>
            </ToolTip>
            <ToolTip content="Help" delay={20}>
              <div
                className="flex items-center justify-center cursor-pointer bg-secondary-400 hover:bg-secondary-500 transition-all duration-200 ease-in-out p-2 rounded"
                onClick={() => setHelpPopup(true)}
              >
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 56 56"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M26.887 37.504c1.617 0 2.367-1.125 2.367-2.625v-.797c.047-3.094 1.172-4.383 4.922-6.96 4.008-2.72 6.562-5.86 6.562-10.384 0-7.031-5.718-11.062-12.82-11.062-5.297 0-9.961 2.508-11.953 7.031-.492 1.102-.703 2.18-.703 3.07 0 1.336.773 2.274 2.203 2.274 1.195 0 1.992-.703 2.344-1.852 1.218-4.453 4.148-6.14 7.945-6.14 4.57 0 8.133 2.578 8.133 6.656 0 3.351-2.086 5.226-5.086 7.336-3.68 2.555-6.375 5.297-6.375 9.422v1.476c0 1.5.82 2.555 2.46 2.555m0 12.82c1.851 0 3.328-1.5 3.328-3.328a3.31 3.31 0 0 0-3.328-3.328c-1.828 0-3.352 1.477-3.352 3.328 0 1.828 1.524 3.328 3.352 3.328" />
                </svg>
              </div>
            </ToolTip>
          </section>
        ) : null}
        <section className="flex flex-col gap-2 w-7/12 max-xl:w-full">
          <div className={mobileDevice == true ? "" : "hidden"}>
            <Keyboard
              onChar={onChar}
              onDelete={onDelete}
              onEnter={onEnter}
              keyStats={keyStats}
              dontListen={true}
              locked={won}
            />
          </div>
          <section className="flex gap-2">
            <div className="rounded bg-secondary-300 max-xs:p-2 w-full flex items-center justify-left">
              {hint ? (
                <p className="pl-2">{`${hintNumber}${
                  hintDirection
                    ? `${hintDirection == "across" ? "A" : "D"}`
                    : ""
                }. ${hint}`}</p>
              ) : (
                <div className="block bg-secondary-300 max-xs:p-2 w-full"></div>
              )}
            </div>
            <div className="rounded bg-secondary-300 p-2 max-xs:p-2 w-1/6 flex items-center justify-center">
              <Stopwatch
                start={isRunning}
                reset={isReset}
                onResetComplete={handleResetComplete}
                onStop={handleStopTime}
              />
            </div>
          </section>
          {showHintCreationPopup ? (
            <section>
              <input
                type="text"
                placeholder={`${hintNumber}${
                  hintDirection
                    ? `${hintDirection == "across" ? "A" : "D"}`
                    : ""
                }. Edit Hint`}
                className="bg-accent-200 p-2 rounded w-full placeholder:text-secondary-900 focus:outline-none"
                value={hint}
                onChange={(event) => editHint(event)}
              />
              <ConnectedButton
                onClickLeft={saveEditHint}
                onClickRight={deactivateHintEditPopup}
                leftStyle="green"
                rightStyle="red"
                leftTitle="Save"
                rightTitle="Cancel"
                containerClassModifier="mt-2"
                leftClassModifier="bg-green-400 hover:bg-green-500"
                rightClassModifier="bg-secondary-400 hover:bg-secondary-500"
              />
            </section>
          ) : null}
          <section className="flex border-black border-t-2 gap-2 h-[30rem] justify-between">
            <div className="w-full">
              <p className="font-bold text-xl text-center">Down</p>
              {buildHints ? (
                <div className="flex flex-col gap-[0.15rem] overflow-scroll h-full">
                  {buildHints.down.map((hint: CrossWordHint, key) => (
                    <p
                      key={key}
                      onClick={() =>
                        handleClickOnHint("down", hint.number, hint.hint)
                      }
                      className="hover:bg-secondary-400 rounded p-1 transition-all duration-200 ease-out cursor-pointer"
                    >{`${hint.number}. ${
                      hint.hint == "" ? "Edit Hint" : hint.hint
                    }`}</p>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="max-sm:hidden h-full mt-1 border border-black block"></div>
            <div className="w-full">
              <p className="font-bold text-xl text-center">Across</p>
              {buildHints ? (
                <div className="flex flex-col gap-[0.15rem] h-full overflow-scroll">
                  {buildHints.across.map((hint: CrossWordHint, key) => (
                    <p
                      key={key}
                      onClick={() =>
                        handleClickOnHint("across", hint.number, hint.hint)
                      }
                      className="hover:bg-secondary-400 rounded p-1 transition-all duration-200 ease-out cursor-pointer"
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
            />
          ) : null}
          {mode === "build" ? (
            <>
              <section className="flex gap-2 items-center justify-between">
                <Button
                  onClick={cancelBuildWorkflow}
                  title="Cancel"
                  classModifier="p-5"
                  style="red"
                />
                <Button
                  onClick={showPublishPopup}
                  title="Update"
                  classModifier="p-5"
                  style="normal"
                />
              </section>
            </>
          ) : null}
        </section>
      </section>
      {publishPopup ? (
        <section className="fixed flex flex-col items-center justify-center left-0 top-0 w-full h-full bg-accent-900 bg-opacity-50">
          <div className="p-10 bg-background-50 rounded-xl w-3/6">
            <p>Crossword Name</p>
            <input
              type="text"
              placeholder="Crossword Name"
              className="bg-accent-200 p-2 rounded w-full placeholder:text-secondary-900 focus:outline-none mb-2"
              value={crosswordName}
              onChange={(event) => setCrosswordName(event.target.value)}
            />
            <p>Crossword Authors</p>
            <input
              type="text"
              placeholder="Authors"
              className="bg-accent-200 p-2 rounded w-full placeholder:text-secondary-900 focus:outline-none"
              value={crosswordAuthor}
              onChange={(event) => setCrosswordAuthor(event.target.value)}
            />
            <div className="flex gap-2 mt-2 items-center">
              <div
                onClick={() => setSaveToArchive(!saveToArchive)}
                className={`block w-9 h-9 border rounded cursor-pointer hover:border-secondary-500 border-secondary-400 transition-all duration-200 ease-in-out ${saveToArchive ? "bg-secondary-400" : ""}`}
              ></div>
              <p>Save to Archive</p>
            </div>
          </div>
          <div className="flex gap-2 mt-2 w-3/6">
            <Button
              onClick={() => setPublishPopup(false)}
              title="Cancel"
              style="red"
              classModifier="p-5"
            />
            <Button
              onClick={updateCrossword}
              title="Update"
              style="normal"
              classModifier="p-5"
            />
          </div>
        </section>
      ) : null}
      {importPopup ? (
        <section className="fixed flex flex-col items-center justify-center left-0 top-0 w-full h-full bg-accent-900 bg-opacity-50">
          <div className="p-10 bg-background-50 rounded-xl w-3/6">
            <textarea
              cols={30}
              rows={10}
              value={importedData}
              onChange={(event) => setImporteData(event.target.value)}
              placeholder="Paste exported crossword data"
              className="bg-accent-200 p-2 rounded w-full placeholder:text-secondary-900 focus:outline-none"
            ></textarea>
          </div>
          <div className="flex gap-2 mt-2 w-3/6">
            <Button
              onClick={() => setImportPopup(false)}
              title="Cancel"
              style="red"
              classModifier="p-5"
            />
            <Button
              onClick={importData}
              title="Import"
              style="normal"
              classModifier="p-5"
            />
          </div>
        </section>
      ) : null}
      {helpPopup ? (
        <section className="fixed flex flex-col items-center justify-center left-0 top-0 w-full h-full bg-accent-900 bg-opacity-50">
          <div className="p-10 bg-background-50 rounded-xl w-3/6">
            <h3 className="text-2xl font-heading">Controls</h3>
            <hr className="border-0 bg-black h-[2px]" />
            <p className="text-lg">Space: Toggles place black mode</p>
            <p className="pl-4">
              Clicking a square while enabled will set it to black
            </p>
            <p className="text-lg">
              Enter: Sets a number in the current edit direction
            </p>
            <p className="pl-4">
              The edit direction is changed with the right and down arrow keys
            </p>
            <p className="text-lg">
              Period: Opens the edit hint popup for the current word
            </p>
            <p className="text-lg">Escape: Removes a number assocation</p>
            <p className="pl-4">
              If the current square has a number in the top right corner, it
              will be removed and all numbers greater than the removed number
              will be down shifted by 1
            </p>
          </div>
          <div className="flex gap-2 mt-2 w-3/6">
            <Button
              onClick={() => setHelpPopup(false)}
              title="Ok"
              style="normal"
              classModifier="p-5"
            />
          </div>
        </section>
      ) : null}
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
              style="normal"
              classModifier="p-5"
            />
            <Button
              onClick={() => router.push("/")}
              title="Browse Games"
              style="normal"
              classModifier="p-5"
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
