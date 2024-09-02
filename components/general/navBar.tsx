"use client";

import { useAuthContext } from "@/lib/contexts/authContext";
import { useRouter, usePathname } from "next/navigation";
import createUserDoc from "@/firebase/db/createUserDoc";
import signOutUser from "@/firebase/auth/signOut";
import googleSignIn from "@/firebase/auth/googleSignIn";
import useScroll from "@/lib/hooks/useScroll";
import routes from "@/lib/routes";

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthContext() as { user: any };

  const findVisibility = (signedIn: boolean, signedOut: boolean) => {
    if (signedIn && signedOut) return true;
    if (signedIn && !signedOut && user) return true;
    if (!signedIn && signedOut && !user) return true;
    return false;
  };

  const handleSignOut = async () => {
    await signOutUser();
    router.push("/");
  };

  const handleSignIn = async () => {
    const result = await googleSignIn();

    if (result.status == "success") {
      let user = result.user;

      if (!user) {
        return;
      }

      await createUserDoc(user);
    } else {
      console.log(result.message);
    }
  };

  return (
    <section
      className={`flex items-center justify-between dark:text-light sticky top-0 w-full z-50 ${
        useScroll(0.1) ? "shadow-bar backdrop-blur-sm px-12 py-4" : "p-4"
      }`}
    >
      <nav className="flex items-center gap-10 font-heading text-xl">
        {routes.map((route) => (
          <button
            type="button"
            key={route.name}
            onClick={() => router.push(route.path)}
            className={`${
              pathname === route.path ? "" : ""
            } rounded p-1 hover:text-secondary-600 transition-all duration-200 ease-in-out ${
              findVisibility(route.signedIn, route.signedOut) ? "" : "hidden"
            }`}
          >
            {route.name}
          </button>
        ))}

        {user ? (
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded p-1 hover:text-secondary-600 transition-all duration-200 ease-in-out"
          >
            Sign Out
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSignIn}
            className="rounded p-1 hover:text-secondary-600 transition-all duration-200 ease-in-out"
          >
            Sign In
          </button>
        )}
      </nav>
    </section>
  );
}
