import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

export default async function saveCrossword(data: string) {
  const crosswordRef = doc(db, "games", "crossword");
  const docSnap = await getDoc(crosswordRef);
  if (docSnap.exists()) {
    await updateDoc(crosswordRef, {
      data: data,
    });
  }
}
