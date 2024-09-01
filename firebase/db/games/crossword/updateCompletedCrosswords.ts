import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

export default async function updateCompletedCrosswords(
  user: any,
  hash: string,
  size: "full" | "mini",
) {
  const crosswordRef = doc(db, "users", user.uid, "games", "crossword");
  const docSnap = await getDoc(crosswordRef);
  if (docSnap.exists()) {
    if (size == "full") {
      await setDoc(
        crosswordRef,
        {
          completedFull: [hash],
        },
        { merge: true },
      );
    } else {
      await setDoc(
        crosswordRef,
        {
          completedMini: [hash],
        },
        { merge: true },
      );
    }
  }
}
