import { doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { db } from "@/firebase/config";

export default async function deleteCrosswordFromArchive(
  data: string,
  size: "full" | "mini",
) {
  const crosswordRef = doc(db, "games", "crossword");
  const docSnap = await getDoc(crosswordRef);

  if (docSnap.exists()) {
    const field =
      size === "full" ? "fullCrosswordArchive" : "miniCrosswordArchive";
    const currentArray = docSnap.data()[field] || [];

    if (currentArray.includes(data)) {
      await updateDoc(crosswordRef, {
        [field]: arrayRemove(data),
      });
    }
  }
}
