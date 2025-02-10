"use client";

import ConnectedButton from "@/components/general/connectedButtons";
import Notification from "@/components/general/notification";
import { useAuthContext } from "@/lib/contexts/authContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export type WordLadderWord = {
  word: string;
  meaning: string;
  shown: boolean;
  solved: boolean;
};

export default function WordLadder() {
  const router = useRouter();
  const { user, isMaksim, isAdmin, isHelper } = useAuthContext() as {
    user: any;
    isMaksim: boolean;
    isAdmin: boolean;
    isHelper: boolean;
  };

  useEffect(() => {
    const list: WordLadderWord[] = [
      {
        word: "stars",
        meaning: "to shine as an actor or singer",
        shown: true,
        solved: false,
      },
      {
        word: "soars",
        meaning: "to fly at a great height",
        shown: false,
        solved: false,
      },
      {
        word: "soaks",
        meaning: "to saturate in liquid",
        shown: false,
        solved: false,
      },
      {
        word: "socks",
        meaning: "to strike forcefully",
        shown: false,
        solved: false,
      },
      {
        word: "locks",
        meaning: "to secure with a fastening device",
        shown: true,
        solved: false,
      },
    ];

    setWords(list);
  }, []);

  const [mode, setMode] = useState<"play" | "build">("play");

  const [notification, setNotification] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationType, setNotificationType] = useState<
    "success" | "error" | "warning"
  >("success");
  const [notificationMessage, setNotificationMessage] = useState("");

  const [words, setWords] = useState<WordLadderWord[]>([]);

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
      setMode("play");
    } else {
      //startBuildWorkflow();
    }
  };

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

  return (
    <div className="flex flex-col gap-2">
      <section className="flex flex-col w-3/4 p-3 mx-auto gap-1 text-lg justify-center rounded-lg">
        {words.map((word: WordLadderWord, i) => (
          <div key={i} className="flex justify-between items-center gap-2 p-3">
            {word.shown ? (
              <p className="flex-1 text-center">{word.word}</p>
            ) : (
              <input
                type="text"
                className="border-b border-b-black focus:outline-none flex-1 bg-secondary-200 pl-1 rounded text-center p-3"
              />
            )}
            <p
              className={`flex-1 p-3 text-center ${word.solved ? "line-through" : ""}`}
            >
              {word.meaning}
            </p>
          </div>
        ))}
      </section>
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
        containerClassModifier="w-3/4 mx-auto"
      />
      {notification ? (
        <Notification
          title={notificationTitle}
          type={notificationType}
          message={notificationMessage}
          timeout={5000}
          updateNotification={(value) => setNotification(value)}
        />
      ) : null}
    </div>
  );
}
