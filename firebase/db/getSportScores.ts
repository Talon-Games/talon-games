import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

export type Sport = {
  name: string;
  home: number;
  away: number;
};

export default async function getSportScores() {
  const configRef = doc(db, "app", "homePage");
  const docSnap = await getDoc(configRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    if (data) {
      return { status: true, data: data.sportsScores as Sport[] };
    } else {
      return { status: false, message: "Document is empty" };
    }
  } else {
    return { status: false, message: "Document does not exist" };
  }
}
