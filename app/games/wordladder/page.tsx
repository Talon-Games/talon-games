"use client";

import ConnectedButton from "@/components/general/connectedButtons";
import Notification from "@/components/general/notification";
import { useAuthContext } from "@/lib/contexts/authContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WordLadder() {
  const router = useRouter();
  const { user, isMaksim, isAdmin, isHelper } = useAuthContext() as {
    user: any;
    isMaksim: boolean;
    isAdmin: boolean;
    isHelper: boolean;
  };

  const [mode, setMode] = useState<"play" | "build">("play");

  const [notification, setNotification] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationType, setNotificationType] = useState<
    "success" | "error" | "warning"
  >("success");
  const [notificationMessage, setNotificationMessage] = useState("");

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
    <>
      <section className="flex flex-col align-center w-1/2 p-5 mx-auto gap-1">
        <div className="flex justify-between align-center gap-5 p-3">
          <p className="flex-1 text-center">stars</p>
          <p className="flex-1">to shine as an actor or singer</p>
        </div>
        <div className="flex justify-between align-center gap-1">
          <input
            type="text"
            className="border-b border-b-black focus:outline-none flex-1 bg-secondary-300 pl-1 rounded text-center"
          />{" "}
          <p className="flex-1 p-3">to fly at a great height</p>
        </div>
        <div className="flex justify-between align-center gap-1">
          <input
            type="text"
            className="border-b border-b-black focus:outline-none flex-1 bg-secondary-300 pl-1 rounded text-center"
          />{" "}
          <p className="flex-1 p-3">to fly at a great height</p>
        </div>
        <div className="flex justify-between align-center gap-1">
          <input
            type="text"
            className="border-b border-b-black focus:outline-none flex-1 bg-secondary-300 pl-1 pt-5 rounded text-center"
          />{" "}
          <p className="flex-1 p-3">to fly at a great height</p>
        </div>
        <div className="flex justify-between align-center gap-5 p-3">
          <p className="flex-1 text-center">locks</p>
          <p className="flex-1">to secure with a fastening device</p>
        </div>
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
    </>
  );
}
