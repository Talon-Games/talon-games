import { doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { db } from "@/firebase/config";

export default async function deleteWordLadderFromArchive(data: string) {
  const wordLadderRef = doc(db, "games", "wordladder");
  const docSnap = await getDoc(wordLadderRef);

  if (docSnap.exists()) {
    const field = "wordLadderData";
    const currentArray = docSnap.data()[field] || [];

    if (currentArray.includes(data)) {
      await updateDoc(wordLadderRef, {
        [field]: arrayRemove(data),
      });
    }
  }
}
