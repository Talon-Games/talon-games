import { collection, doc, getDocs, deleteDoc, query } from "firebase/firestore";
import googleSignOut from "@/firebase/auth/signOut";
import { db } from "@/firebase/config";

const deleteAccount = async (user: any) => {
  const userRef = doc(db, "users", user.uid);
  const userQuery = query(collection(db, "users"));
  const userDocs = await getDocs(userQuery);
  userDocs.forEach((doc) => {
    if (doc.data().uid === user.uid) {
      deleteDoc(doc.ref);
    }
  });

  deleteDoc(userRef);
  googleSignOut();
};

export default deleteAccount;
