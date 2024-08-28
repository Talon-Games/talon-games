import { doc, deleteDoc } from "firebase/firestore";
import googleSignOut from "@/firebase/auth/signOut";
import { db } from "@/firebase/config";

const deleteAccount = async (user: any) => {
  const userRef = doc(db, "users", user.uid);
  await deleteDoc(userRef);

  googleSignOut();
};

export default deleteAccount;
