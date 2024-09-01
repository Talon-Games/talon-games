import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

export default async function saveCrossword(
  data: string,
  size: "full" | "mini",
) {
  const crosswordRef = doc(db, "games", "crossword");
  const docSnap = await getDoc(crosswordRef);
  if (docSnap.exists()) {
    if (size == "full") {
      await updateDoc(crosswordRef, {
        crosswordFull: data,
      });
    } else {
      await updateDoc(crosswordRef, {
        crosswordMini: data,
      });
    }
  }
}
