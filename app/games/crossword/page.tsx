"use client";
// To the person who next works on this, im sorry
import { useState, useEffect } from "react";
import Notification from "@/components/general/notification";
import { useAuthContext } from "@/lib/contexts/authContext";
import { auth } from "@/firebase/config";
import getRoles from "@/firebase/db/getRoles";
import saveCrossword from "@/firebase/db/saveCrossword";
import getCrossword from "@/firebase/db/getCrossword";

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
  const width = 15;
  const height = 15;

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

  const [author, setAuthor] = useState("");
  const [published, setPublished] = useState("");

  const [mode, setMode] = useState<"play" | "build">("play");
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
  const [showHintCreationPopup, setShowHintCreationPopup] = useState(false);
  const [hintNumber, setHintNumber] = useState<number | undefined>(undefined);
  const [hintDirection, setHintDirection] = useState<
    "down" | "across" | undefined
  >(undefined);
  const [hint, setHint] = useState("");
  const [checked, setChecked] = useState(false);

  const [isMaksim, setIsMaksim] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHelper, setIsHelper] = useState(false);
  const [numbersToCheck, setNumbersToCheck] = useState<number[]>([]);

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
    getCrossword().then((data) => {
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
  };

  const highlight = (
    x: number,
    y: number,
    direction: "across" | "down" | "both",
    onlyDirections: boolean,
  ) => {
    if (!buildData || buildData[y][x].state === "black") return;

    const tempData = buildData.map((row) => row.map((box) => ({ ...box })));

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
    setBuildData(tempData);
  };

  const setNumber = () => {
    if (!buildData) {
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
    //TODO: allow for a number to be noth down and across
    let location = currentSelectionNumberXY;
    if (!location) {
      triggerNotification(
        "Failed to set number",
        "error",
        "Location not found",
      );
      return;
    }

    const tempData = buildData.map((row) => row.map((box) => ({ ...box })));
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

        const getCurrentState = (): {
          direction: "down" | "across";
          possible: boolean;
        } => {
          const nextBlock = getNextBlock();

          if (nextBlock == undefined) {
            return { direction: "across", possible: true };
          }

          if (nextBlock.state == "black") {
            if (tempData[startY][x].next == "down") {
              return { direction: "down", possible: true };
            } else {
              return { direction: "across", possible: false };
            }
          }

          return { direction: "across", possible: true };
        };

        let currentState = getCurrentState();

        let belongsTo = tempData[startY][x].belongsTo;
        belongsTo.push(currentEditNumber);
        tempData[startY][x].belongsTo = belongsTo;

        tempData[startY][x].next = currentState.direction;

        if (currentState.possible == false) {
          break;
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

        const getCurrentState = (): {
          direction: "down" | "across";
          possible: boolean;
        } => {
          const nextBlock = getNextBlock();

          if (nextBlock == undefined) {
            return { direction: "down", possible: true };
          }

          if (nextBlock.state == "black") {
            if (tempData[y][startX].next == "across") {
              return { direction: "across", possible: true };
            } else {
              return { direction: "down", possible: false };
            }
          }

          return { direction: "down", possible: true };
        };

        let currentState = getCurrentState();

        let belongsTo = tempData[y][startX].belongsTo;
        belongsTo.push(currentEditNumber);
        tempData[y][startX].belongsTo = belongsTo;

        tempData[y][startX].next = currentState.direction;

        if (currentState.possible == false) {
          break;
        }
      }
    }

    tempData[location[1]][location[0]].number = currentEditNumber;

    setBuildData(tempData);
  };

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
        state: box.answer === "" ? "black" : box.state,
        belongsTo: [],
      })),
    );
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
        letter: "",
        number: undefined,
        belongsTo: [],
        next: undefined,
      })),
    );
    setBuildData(tempData);
  };

  const clearHighlightAndSelection = () => {
    if (!buildData) {
      triggerNotification(
        "Failed to clear highlight and selection",
        "error",
        "Data not found",
      );
      return;
    }
    const tempData = buildData.map((row) =>
      row.map((box) => ({
        ...box,
        state:
          box.state === "highlighted" || box.state === "selected"
            ? "normal"
            : box.state,
      })),
    );
    setBuildData(tempData);
  };

  const selectCurrent = (x: number, y: number) => {
    if (!buildData) {
      triggerNotification(
        "Failed to select current",
        "error",
        "Data not found",
      );
      return;
    }
    let tempData = buildData.map((row) => row.map((box) => ({ ...box })));

    tempData[y][x].state = "selected";

    setBuildData(tempData);
  };

  const editModeSelector = (
    mode: "editBlack" | "placeNumbers" | "placeLetters",
  ) => {
    clearHighlightAndSelection();
    setEditMode(mode);
  };

  const toggleBlack = (x: number, y: number) => {
    if (!buildData) {
      triggerNotification("Failed to toggle black", "error", "Data not found");
      return;
    }

    let tempData = buildData.map((row) => row.map((box) => ({ ...box })));

    if (tempData[y][x].number != undefined) {
      triggerNotification(
        "Failed to toggle black",
        "error",
        "Square has a number",
      );
      return;
    }

    tempData[y][x].answer = "";
    tempData[y][x].belongsTo = [];
    tempData[y][x].next = undefined;

    if (tempData[y][x].state == "black") {
      tempData[y][x].state = "normal";
    } else {
      tempData[y][x].state = "black";
    }

    setBuildData(tempData);
  };

  const takeAction = (x: number, y: number) => {
    //TODO: something for mobile support prob here
    clearHighlightAndSelection();
    if (mode == "play") {
      startLetterPlacer(x, y);
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
    if (!buildData) {
      triggerNotification(
        "Failed to start letter placer",
        "error",
        "Data not found",
      );
      return;
    }

    if (buildData[y][x].state == "black") {
      triggerNotification(
        "Failed to start letter placer",
        "warning",
        "Cant place letters on black squares",
      );
      return;
    }

    if (buildData[y][x].belongsTo.length == 0) {
      triggerNotification(
        "Failed to start letter placer",
        "warning",
        "Cant place letter on a square without an association",
      );
      return;
    }

    setCurrentTrend(buildData[y][x].next);

    let next = buildData[y][x].next;

    setCurrentSelectionNumberXY([x, y]);
    if (!next) {
      highlight(x, y, highlightMode, mode == "play" ? false : true);
      return;
    } else {
      highlight(x, y, next, mode == "play" ? false : true);
    }
  };

  const startNumberPlacer = (x: number, y: number) => {
    if (!buildData) {
      triggerNotification(
        "Failed to start number placer",
        "error",
        "Data not found",
      );
      return;
    }

    if (buildData[y][x].state == "black") {
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
            mode == "build" &&
            editMode == "placeNumbers" &&
            !showHintCreationPopup
          ) {
            event.preventDefault();
            handleRightKeyForNumberPlacer();
          }
          break;
        case "ArrowDown":
          if (
            mode == "build" &&
            editMode == "placeNumbers" &&
            !showHintCreationPopup
          ) {
            event.preventDefault();
            handleDownKeyForNumberPlacer();
          }
          break;
        case "Enter":
          if (mode == "play") {
            toggleEnterCheckNumbers();
          }
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
    numbersToCheck,
  ]);

  const toggleEnterCheckNumbers = () => {
    if (numbersToCheck.length != 0) {
      setNumbersToCheck([]);
      return;
    }

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

    const originX = location[0];
    const originY = location[1];

    let belongsTo = buildData[originY][originX].belongsTo;

    setNumbersToCheck(belongsTo);
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
    if (block.belongsTo.length == 0 || block.state == "black") {
      triggerNotification(
        "Failed to place letter",
        "warning",
        "Letters can only be placed on squares associated with a number",
      );
      return;
    }
    if (mode == "play") {
      tempData[location[1]][location[0]].guess = key;
    } else {
      tempData[location[1]][location[0]].answer = key;
    }

    if (currentTrend && tempData[location[1]][location[0]].next) {
      if (
        currentTrend == "across" &&
        location[0] + 1 != width &&
        tempData[location[1]][location[0] + 1].state != "black"
      ) {
        tempData[location[1]][location[0]].state = "normal";
        tempData[location[1]][location[0] + 1].state = "selected";
        setCurrentSelectionNumberXY([location[0] + 1, location[1]]);
      } else if (
        currentTrend == "down" &&
        location[1] + 1 != height &&
        tempData[location[1] + 1][location[0]].state != "black"
      ) {
        tempData[location[1] + 1][location[0]].state = "selected";
        tempData[location[1]][location[0]].state = "normal";
        setCurrentSelectionNumberXY([location[0], location[1] + 1]);
      }
    }

    setBuildData(tempData);
  };

  const handleEnterForNumberPlace = () => {
    if (!currentEditDirection) {
      triggerNotification(
        "Failed to handle enter for number",
        "error",
        "Current edit direction not found",
      );
      return;
    }
    clearHighlightAndSelection();
    setNumber();
    addNewHintToList(currentEditDirection, currentEditNumber);
    setCurrentEditDirection(undefined);
    setCurrentEditNumber(currentEditNumber + 1);
    setCurrentSelectionNumberXY(undefined);
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

    if (direction == "across") {
      tempHints.across.push(hint);
    } else {
      tempHints.down.push(hint);
    }

    setBuildHints(tempHints);
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

  const handleClickOnHint = (
    direction: "across" | "down",
    number: number,
    hint: string,
  ) => {
    if (mode == "play") {
      gotoWord(number, direction);
    } else {
      activateHintEditPopup(direction, number, hint);
    }
  };

  const gotoWord = (number: number, direction: "across" | "down") => {
    if (!buildData) {
      triggerNotification("Failed to goto word", "error", "Data not found");
      return;
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (buildData[y][x].number == number) {
          setCurrentTrend(direction);
          setCurrentSelectionNumberXY([x, y]);
          highlight(x, y, highlightMode, false);
          break;
        }
      }
    }
  };

  const editHint = (event: any) => {
    setHint(event.target.value);
  };

  const formatDate = (date: Date) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    const getOrdinalSuffix = (day: number) => {
      if (day > 3 && day < 21) return "th";
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    return `${month} ${day}${getOrdinalSuffix(day)}, ${year}`;
  };

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

    let tempData = buildData;

    if (!tempData) {
      triggerNotification("Crossword update failed", "error", "Data not found");
      return;
    }

    for (let y = 0; y < tempData.length; y++) {
      for (let x = 0; x < tempData[y].length; x++) {
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
    saveCrossword(jsonCrosswordString);

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

  function decodeJsonData(data: string): Crossword {
    let jsonCrossword = JSON.parse(data);

    let crossword: Crossword = {
      data: jsonCrossword.data,
      hints: jsonCrossword.hints,
      author: jsonCrossword.author,
      published: jsonCrossword.published,
    };

    return crossword;
  }

  const toggleChecked = () => {
    if (mode == "build") {
      return;
    }
    setChecked(!checked);
  };

  const isCheckable = (x: number, y: number, belongsTo: number[]) => {
    if (checked) {
      return true;
    }

    for (let i = 0; i < belongsTo.length; i++) {
      if (numbersToCheck.includes(belongsTo[i])) {
        return entireWordIsFilled(belongsTo[i]);
      }
    }
  };

  const entireWordIsFilled = (number: number) => {
    return true;
  };

  const toggleShowAssociations = () => {
    setShowAssociations(!showAssociations);
  };

  return (
    <main className="py-2">
      <section className="flex justify-center gap-2 max-xl:flex-col">
        <section className="flex flex-col bg-accent-100 rounded-xl p-5 max-xl:items-center">
          {buildData?.map((row: CrossWordBoxData[], y) => (
            <div key={y} className="flex">
              {row.map((box: CrossWordBoxData, x) => (
                <div
                  key={x}
                  onClick={() => takeAction(x, y)}
                  className={`w-[40px] h-[40px] max-md:w-[35px] max-md:h-[35px] max-sm:w-[25px] max-sm:h-[25px] max-xs:w-[20px] max-xs:h-[20px] border border-black cursor-pointer flex items-center justify-center relative ${
                    box.state == "highlighted" ? "border-secondary-500" : null
                  } ${
                    box.state == "selected"
                      ? "border-secondary-500 bg-secondary-50"
                      : null
                  } ${
                    box.state == "black" ? "bg-accent-900 cursor-default" : null
                  } ${
                    showAssociations &&
                    mode == "build" &&
                    box.state != "black" &&
                    box.answer == ""
                      ? "bg-red-200"
                      : ""
                  }
 ${
   isCheckable(x, y, box.belongsTo) && box.state != "black"
     ? `${box.guess == box.answer ? "bg-green-200" : "bg-red-200"}`
     : ""
 }`}
                >
                  <p className="absolute text-sm top-[1px] left-1">
                    {box.number}
                  </p>
                  <p>{`${mode == "play" ? box.guess : box.answer}`}</p>
                </div>
              ))}
            </div>
          ))}
          <div className="flex items-center justify-between mt-2 max-xl:w-full">
            <p>{`Crossword by ${author}`}</p>
            <p>{`Published ${published}`}</p>
          </div>
        </section>
        <section className="flex flex-col gap-2 w-full">
          <section className="flex gap-2 justify-between max-sm:flex-col">
            <div className="bg-accent-100 p-5 w-full rounded-xl max-sm:p-2">
              <p className="font-bold text-xl text-center">Down</p>
              {buildHints ? (
                <div className="flex flex-col gap-2">
                  {buildHints.down.map((hint: CrossWordHint, key) => (
                    <p
                      key={key}
                      onClick={() =>
                        handleClickOnHint("down", hint.number, hint.hint)
                      }
                      className="hover:bg-secondary-100 p-2 transition-all duration-200 ease-out cursor-pointer rounded-lg"
                    >{`${hint.number}. ${
                      hint.hint == "" ? "Edit Hint" : hint.hint
                    }`}</p>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="bg-accent-100 p-5 w-full rounded-xl">
              <p className="font-bold text-xl text-center">Across</p>
              {buildHints ? (
                <div className="flex flex-col gap-2">
                  {buildHints.across.map((hint: CrossWordHint, key) => (
                    <p
                      key={key}
                      onClick={() =>
                        handleClickOnHint("across", hint.number, hint.hint)
                      }
                      className="hover:bg-secondary-100 p-2 transition-all duration-200 ease-out cursor-pointer rounded-lg"
                    >{`${hint.number}. ${
                      hint.hint == "" ? "Edit Hint" : hint.hint
                    }`}</p>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
          <button
            onClick={toggleChecked}
            className={`w-full p-2 rounded-lg transition-all duration-200 ease-in-out ${
              mode == "build"
                ? "bg-accent-300 hover:bg-accent-300 cursor-default"
                : "bg-secondary-200 hover:bg-secondary-300"
            }`}
          >
            check
          </button>
          {user && (isMaksim || isAdmin || isHelper) ? (
            <div className="flex">
              <button
                onClick={toggleMode}
                className={`w-full p-2 bg-secondary-200 hover:bg-secondary-300 rounded-tl-lg rounded-bl-lg transition-all duration-200 ease-in-out ${
                  mode === "play" ? "bg-secondary-400" : ""
                }`}
              >
                Play
              </button>
              <button
                onClick={toggleMode}
                className={`w-full p-2 bg-secondary-200 hover:bg-secondary-300 rounded-tr-lg rounded-br-lg transition-all duration-200 ease-in-out ${
                  mode === "build" ? "bg-secondary-400" : ""
                }`}
              >
                Build
              </button>
            </div>
          ) : null}
          {mode === "build" ? (
            <>
              <section className="bg-accent-100 p-5 rounded-xl">
                <p className="font-bold text-xl text-center">Build Tools</p>
                <p className="text-red-500 text-center italic">
                  There is no undo. I will not make one. Dont mess up.
                </p>
                <div className="flex gap-2">
                  <button
                    className="bg-secondary-200 p-2 rounded-lg w-full hover:bg-secondary-300 transition-all duration-200 ease-in-out"
                    onClick={fillNoneLettersBlack}
                  >
                    Blackout
                  </button>
                  <button
                    className="bg-secondary-200 p-2 rounded-lg w-full hover:bg-secondary-300 transition-all duration-200 ease-in-out"
                    onClick={fillBlackEmpty}
                  >
                    Whiteout
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
                    Clear Numbers
                  </button>
                </div>
                <button
                  className="bg-secondary-200 mt-2 p-2 rounded-lg w-full hover:bg-secondary-300 transition-all duration-200 ease-in-out"
                  onClick={toggleShowAssociations}
                >
                  Toggle Associations
                </button>
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
                <button
                  className="bg-red-200 p-5 rounded-lg w-full hover:bg-red-300 transition-all duration-200 ease-in-out"
                  onClick={cancelBuildWorkflow}
                >
                  Cancel
                </button>
                <button
                  className="bg-secondary-200 p-5 rounded-lg w-full hover:bg-secondary-300 transition-all duration-200 ease-in-out"
                  onClick={updateCrossword}
                >
                  Update
                </button>
              </section>
            </>
          ) : null}
        </section>
      </section>
      {showHintCreationPopup ? (
        <section className="fixed flex items-center justify-center left-0 top-0 w-full h-full bg-accent-900 bg-opacity-50">
          <div className="p-10 bg-background-50 rounded-xl">
            <input
              type="text"
              placeholder="Edit Hint"
              className="bg-accent-200 p-2 rounded-lg w-full placeholder:text-secondary-900 focus:outline-none"
              value={hint}
              onChange={(event) => editHint(event)}
            />
            <div className="flex mt-2">
              <button
                onClick={saveEditHint}
                className="w-full p-2 bg-red-200 hover:bg-red-300 rounded-tl-lg rounded-bl-lg transition-all duration-200 ease-in-out"
              >
                Save
              </button>
              <button
                onClick={deactivateHintEditPopup}
                className="w-full p-2 bg-secondary-200 hover:bg-secondary-300 rounded-tr-lg rounded-br-lg transition-all duration-200 ease-in-out"
              >
                Cancel
              </button>
            </div>
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
