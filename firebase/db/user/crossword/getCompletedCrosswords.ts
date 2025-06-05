import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

export default async function getCompletedCrosswords(
  user: any,
  size: "full" | "mini",
) {
  const crosswordRef = doc(db, "users", user.uid, "games", "crossword");
  const docSnap = await getDoc(crosswordRef);

  if (docSnap.exists()) {
    const crosswordData = docSnap.data();
    if (size === "full") {
      return crosswordData.completedFull || [];
    } else {
      return crosswordData.completedMini || [];
    }
  } else {
    const defaultData = {
      completedFull: [],
      completedMini: [],
    };
    await setDoc(crosswordRef, defaultData);

    return [];
  }
}
