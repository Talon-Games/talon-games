import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

export default async function setHighScore(
  user: any,
  time: number,
  date: string,
  size: "full" | "mini",
) {
  const crosswordRef = doc(db, "users", user.uid, "games", "crossword");
  const docSnap = await getDoc(crosswordRef);
  if (docSnap.exists()) {
    if (size == "full") {
      await updateDoc(crosswordRef, {
        highScoreFullTime: time,
        highScoreFullDate: date,
      });
    } else {
      await updateDoc(crosswordRef, {
        highScoreMiniTime: time,
        highScoreMiniDate: date,
      });
    }
  }
}
