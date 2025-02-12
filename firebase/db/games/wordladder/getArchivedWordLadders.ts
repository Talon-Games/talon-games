import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

export default async function getArchivedWordLadders() {
  const wordLadderRef = doc(db, "games", "wordladder");
  const docSnap = await getDoc(wordLadderRef);

  if (docSnap.exists()) {
    const wordLadderData = docSnap.data();

    return wordLadderData.wordLadderArhive;
  }
}
