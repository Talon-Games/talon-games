import { getAuth, signOut } from "firebase/auth";

export default async function signOutUser() {
  const auth = getAuth();
  await signOut(auth);
}
