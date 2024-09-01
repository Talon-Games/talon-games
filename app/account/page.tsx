"use client";

import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import Notification from "@/components/general/notification";
import deleteAccount from "@/firebase/db/deleteAccount";
import { useAuthContext } from "@/lib/contexts/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { auth, db } from "@/firebase/config";
import getRoles from "@/firebase/db/getRoles";

interface User {
  isMaksim: boolean;
  isAdmin: boolean;
  isHelper: boolean;
  email: string;
  name: string;
  uid: string;
}

export default function Account() {
  const router = useRouter();
  const { user } = useAuthContext() as { user: any };
  const [userList, setUserList] = useState<User[]>([]);
  const [filteredUserList, setFilteredUserList] = useState<User[]>(userList);

  const [isMaksim, setIsMaksim] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHelper, setIsHelper] = useState(false);

  const [notification, setNotification] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationType, setNotificationType] = useState<
    "success" | "error" | "warning"
  >("success");
  const [notificationMessage, setNotificationMessage] = useState("");

  const [confirmDeletePopup, setConfirmDeletePopup] = useState(false);

  const triggerNotification = (
    title: string,
    type: "success" | "error" | "warning",
    message: string,
  ) => {
    setNotification(true);
    setNotificationTitle(title);
    setNotificationType(type);
    setNotificationMessage(message);
  };

  useEffect(() => {
    if (user == null) {
      router.push("/");
    } else {
      getRoles(auth.currentUser).then(
        (roles: { isMaksim: boolean; isAdmin: boolean; isHelper: boolean }) => {
          setIsMaksim(roles.isMaksim);
          setIsAdmin(roles.isAdmin);
          setIsHelper(roles.isHelper);
          if (roles.isMaksim || roles.isAdmin) {
            const users = collection(db, "users");
            getDocs(users)
              .then((querySnapshot) => {
                const data: any = [];
                querySnapshot.forEach((doc) => {
                  data.push(doc.data());
                });
                setUserList(data);
                setFilteredUserList(data);
              })
              .catch((error) => {
                console.error("Error:", error);
              });
          }
        },
      );
    }
  }, [user, router]);

  useEffect(() => {
    setFilteredUserList(userList);
  }, [userList]);

  const searchUsers = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value.toLowerCase();
    const filteredUsers = userList.filter((user) => {
      return (
        user.email.toLowerCase().includes(searchTerm) ||
        user.name.toLowerCase().includes(searchTerm)
      );
    });
    setFilteredUserList(filteredUsers);
  };

  const updateUsersHelperStatus = (user: any) => {
    if (user.uid === auth.currentUser?.uid) {
      triggerNotification(
        "Failed to update helper",
        "error",
        "You can't change your own status",
      );
      return;
    }

    if (user.isMaksim) {
      triggerNotification(
        "Failed to update helper",
        "error",
        "You cant change this users roles",
      );
      return;
    }

    const updatedUserList = userList.map((u) => {
      if (u.uid === user.uid) {
        return { ...u, isHelper: !u.isHelper };
      }
      return u;
    });

    setUserList(updatedUserList);

    const userRef = doc(db, "users", user.uid);
    const newHelperStatus = !user.isHelper;
    setDoc(
      userRef,
      {
        isHelper: newHelperStatus,
      },
      { merge: true },
    ).catch((error) => {
      console.log(error);
      triggerNotification("Failed to update helper", "error", "Unknown error");
    });
  };

  const updateUsersAdminStatus = (user: any) => {
    if (user.uid === auth.currentUser?.uid) {
      triggerNotification(
        "Failed to update admin",
        "error",
        "You can't change your own status",
      );
      return;
    }

    if (user.isMaksim) {
      triggerNotification(
        "Failed to update admin",
        "error",
        "This user is Maksim",
      );
      return;
    }

    const updatedUserList = userList.map((u) => {
      if (u.uid === user.uid) {
        return { ...u, isAdmin: !u.isAdmin };
      }
      return u;
    });

    setUserList(updatedUserList);

    const userRef = doc(db, "users", user.uid);
    const newAdminStatus = !user.isAdmin;
    setDoc(
      userRef,
      {
        isAdmin: newAdminStatus,
      },
      { merge: true },
    ).catch((error) => {
      console.log(error);
      triggerNotification("Failed to update admin", "error", "Unknown error");
    });
  };

  const startDeleteWorkflow = () => {
    setConfirmDeletePopup(true);
  };

  const stopDeleteWorkflow = () => {
    setConfirmDeletePopup(false);
  };

  const deleteAccountHandler = () => {
    deleteAccount(auth.currentUser)
      .then(() => {
        setConfirmDeletePopup(false);
        router.push("/");
      })
      .catch((error) => {
        console.log(error);
        triggerNotification(
          "Failed to delete account",
          "error",
          "Unknown error",
        );
      });
  };

  return (
    <main className="flex flex-col gap-2 items-center py-2">
      <h1 className="font-heading text-center text-8xl max-sm:text-7xl max-xs:text-6xl">
        Account
      </h1>
      {isAdmin ? (
        <section className="w-full p-5 h-[26rem] bg-accent-100 rounded-xl">
          <h1 className="text-xl font-bold font-heading">User Management</h1>
          <input
            type="text"
            placeholder="Search Users"
            className="bg-accent-200 p-2 rounded-lg w-full placeholder:text-secondary-900 focus:outline-none"
            onChange={searchUsers}
          />
          <div className="flex flex-col gap-2 mt-2 overflow-y-scroll h-72">
            {filteredUserList.map((user: any) => (
              <div
                key={user.uid}
                className=" bg-accent-200 p-2 rounded-lg bg-opacity-70"
              >
                <h2 className="px-1">{user.name}</h2>
                <p className="px-1">{user.email}</p>
                <section className="flex gap-2">
                  {isAdmin ? (
                    <div className="py-2 w-2/12 max-sm:w-3/12 max-xs:w-4/12">
                      <p className="bg-secondary-100 text-center p-1 rounded-tl-lg rounded-tr-lg">
                        {user.isHelper ? "Helper" : "Not Helper"}
                      </p>
                      <button
                        onClick={() => updateUsersHelperStatus(user)}
                        className={`${
                          user.isHelper
                            ? "bg-red-300 hover:bg-red-400"
                            : "bg-green-300 hover:bg-green-400"
                        } p-1 text-center w-full rounded-bl-lg rounded-br-lg transition-all duration-200 ease-in-out`}
                      >
                        {user.isHelper ? "Remove" : "Add"}
                      </button>
                    </div>
                  ) : null}
                  {isMaksim ? (
                    <div className="py-2 w-2/12 max-sm:w-3/12 max-xs:w-4/12">
                      <p className="bg-secondary-100 text-center p-1 rounded-tl-lg rounded-tr-lg">
                        {user.isAdmin ? "Admin" : "Not Admin"}
                      </p>
                      <button
                        onClick={() => updateUsersAdminStatus(user)}
                        className={`${
                          user.isAdmin
                            ? "bg-red-300 hover:bg-red-400"
                            : "bg-green-300 hover:bg-green-400"
                        } p-1 text-center w-full rounded-bl-lg rounded-br-lg transition-all duration-200 ease-in-out`}
                      >
                        {user.isAdmin ? "Remove" : "Add"}
                      </button>
                    </div>
                  ) : null}
                </section>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      <button
        className="bg-red-300 p-5 rounded-lg w-full hover:bg-red-400 transition-all duration-200 ease-in-out"
        onClick={startDeleteWorkflow}
      >
        Delete Account
      </button>
      {confirmDeletePopup ? (
        <section className="fixed flex items-center justify-center left-0 top-0 w-full h-full bg-accent-900 bg-opacity-50">
          <div className="p-10 bg-background-50 rounded-xl">
            <p>Are you sure you want to delete your account?</p>
            <div className="flex mt-2">
              <button
                onClick={deleteAccountHandler}
                className="w-full p-2 bg-red-200 hover:bg-red-300 rounded-tl-lg rounded-bl-lg transition-all duration-200 ease-in-out"
              >
                Yes
              </button>
              <button
                onClick={stopDeleteWorkflow}
                className="w-full p-2 bg-secondary-200 hover:bg-secondary-300 rounded-tr-lg rounded-br-lg transition-all duration-200 ease-in-out"
              >
                No
              </button>
            </div>
          </div>
        </section>
      ) : null}
      {notification ? (
        <Notification
          title={notificationTitle}
          type={notificationType}
          message={notificationMessage}
          timeout={5000}
          updateNotification={(value) => setNotification(value)}
        />
      ) : null}
    </main>
  );
}
