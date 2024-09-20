import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

export default async function getArchivedCrosswords(size: "full" | "mini") {
  const crosswordRef = doc(db, "games", "crossword");
  const docSnap = await getDoc(crosswordRef);

  if (docSnap.exists()) {
    const crosswordData = docSnap.data();

    if (size == "full") {
      return crosswordData.fullCrosswordArchive;
    } else {
      return crosswordData.miniCrosswordArchive;
    }
  }
}
