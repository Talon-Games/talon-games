import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

export default async function getCrossword() {
  const crosswordRef = doc(db, "games", "crossword");
  const docSnap = await getDoc(crosswordRef);
  if (docSnap.exists()) {
    const crosswordData = docSnap.data();
    return crosswordData.data;
  }
}
