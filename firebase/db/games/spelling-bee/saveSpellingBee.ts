import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/firebase/config";

export default async function saveSpellingBee(id: string, data: string) {
  const spellingBeeRef = doc(db, "games", "spellingbee");
  const docSnap = await getDoc(spellingBeeRef);
  if (docSnap.exists()) {
    await updateDoc(spellingBeeRef, {
      spellingBee: data,
      createdSpellingBees: arrayUnion(id),
      spellingBeeArchive: arrayUnion(data),
    });
  }
}
