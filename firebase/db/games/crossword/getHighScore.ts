import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

export default async function getHighScore(user: any, size: "full" | "mini") {
  const crosswordRef = doc(db, "users", user.uid, "games", "crossword");
  const docSnap = await getDoc(crosswordRef);

  if (docSnap.exists()) {
    const crosswordData = docSnap.data();
    if (size === "full") {
      const time = crosswordData.highScoreFullTime;
      const date = crosswordData.highScoreFullDate;
      return { time: time, date: date };
    } else {
      const time = crosswordData.highScoreMiniTime;
      const date = crosswordData.highScoreMiniDate;
      return { time: time, date: date };
    }
  }
}
