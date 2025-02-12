import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/firebase/config";

export default async function saveWordLadder(
  data: string,
  saveToArchive: boolean,
) {
  const wordLadderRef = doc(db, "games", "wordladder");
  const docSnap = await getDoc(wordLadderRef);
  if (docSnap.exists()) {
    await updateDoc(wordLadderRef, {
      wordLadder: data,
    });
  }

  if (docSnap.exists() && saveToArchive) {
    await updateDoc(wordLadderRef, {
      wordLadderArchive: arrayUnion(data),
    });
  }
}
