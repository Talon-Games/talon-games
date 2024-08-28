import { collection, getDoc, setDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/config";

export default async function createUserDoc(user: any) {
  const users = collection(db, "users");
  const userRef = doc(users, user.uid);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) {
    try {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        isMaksim: false,
        isAdmin: false,
        isHelper: false,
      });
      return { status: "success", message: "User doc created" };
    } catch (error) {
      return { status: "error", message: "Failed to create user doc" };
    }
  } else {
    return { status: "error", message: "User already exists" };
  }
}
