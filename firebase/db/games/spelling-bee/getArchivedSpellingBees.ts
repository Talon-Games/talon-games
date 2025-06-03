import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

export default async function getArchivedSpellingBees() {
  const spellingBeeRef = doc(db, "games", "spellingbee");
  const docSnap = await getDoc(spellingBeeRef);

  if (docSnap.exists()) {
    const spellingBeeData = docSnap.data();

    return spellingBeeData.spellingBeeArchive;
  }
}
