import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

export default async function getCategories() {
  const configRef = doc(db, "app", "config");
  const docSnap = await getDoc(configRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    if (data) {
      return { status: true, data: data.categories };
    } else {
      return { status: false, message: "Document is empty" };
    }
  } else {
    return { status: false, message: "Document does not exist" };
  }
}
