import { doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { db } from "@/firebase/config";

export default async function deleteSpellingBeeFromArchive(
  id: string,
  data: string,
) {
  const spellingBeeRef = doc(db, "games", "spellingbee");
  const docSnap = await getDoc(spellingBeeRef);

  if (docSnap.exists()) {
    const spellingBeeArchives = "spellingBeeArchive";
    const currentSpellingBees = docSnap.data()[spellingBeeArchives] || [];

    if (currentSpellingBees.includes(data)) {
      await updateDoc(spellingBeeRef, {
        [spellingBeeArchives]: arrayRemove(data),
      });
    }

    const createdSpellingBees = "createdSpellingBees";
    const currentCreatedSpellingBees =
      docSnap.data()[createdSpellingBees] || [];

    if (currentCreatedSpellingBees.includes(id)) {
      await updateDoc(spellingBeeRef, {
        [createdSpellingBees]: arrayRemove(id),
      });
    }
  }
}
