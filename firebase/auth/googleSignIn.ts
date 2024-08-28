import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default async function googleSignIn() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(getAuth(), provider);
    const user = result.user;
    return { status: "success", user: user };
  } catch (error: any) {
    return { status: "error", message: error.message };
  }
}
