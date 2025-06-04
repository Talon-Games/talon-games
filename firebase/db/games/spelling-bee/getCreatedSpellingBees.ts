import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

export default async function getCreatedSpellingBees(): Promise<
  string[] | undefined
> {
  const spellingBeeRef = doc(db, "games", "spellingbee");
  const docSnap = await getDoc(spellingBeeRef);

  if (docSnap.exists()) {
    const spellingBeeData = docSnap.data();

    return spellingBeeData.createdSpellingBees;
  }

  return undefined;
}
