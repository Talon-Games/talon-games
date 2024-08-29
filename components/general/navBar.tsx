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
      <div className="flex items-center gap-4">
        <a href="https://github.com/cqb13/talon-games" target="_blank">
          <svg
            width="40px"
            height="40px"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            data-name="Layer 1"
            className="hover:cursor-pointer hover:fill-secondary-600 transition-all duration-200 ease-in-out"
          >
            <path d="M12,2.2467A10.00042,10.00042,0,0,0,8.83752,21.73419c.5.08752.6875-.21247.6875-.475,0-.23749-.01251-1.025-.01251-1.86249C7,19.85919,6.35,18.78423,6.15,18.22173A3.636,3.636,0,0,0,5.125,16.8092c-.35-.1875-.85-.65-.01251-.66248A2.00117,2.00117,0,0,1,6.65,17.17169a2.13742,2.13742,0,0,0,2.91248.825A2.10376,2.10376,0,0,1,10.2,16.65923c-2.225-.25-4.55-1.11254-4.55-4.9375a3.89187,3.89187,0,0,1,1.025-2.6875,3.59373,3.59373,0,0,1,.1-2.65s.83747-.26251,2.75,1.025a9.42747,9.42747,0,0,1,5,0c1.91248-1.3,2.75-1.025,2.75-1.025a3.59323,3.59323,0,0,1,.1,2.65,3.869,3.869,0,0,1,1.025,2.6875c0,3.83747-2.33752,4.6875-4.5625,4.9375a2.36814,2.36814,0,0,1,.675,1.85c0,1.33752-.01251,2.41248-.01251,2.75,0,.26251.1875.575.6875.475A10.0053,10.0053,0,0,0,12,2.2467Z" />
          </svg>
        </a>
      </div>
    </section>
  );
}
