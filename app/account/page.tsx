"use client";

import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import Notification from "@/components/general/notification";
import deleteAccount from "@/firebase/db/deleteAccount";
import { useAuthContext } from "@/lib/contexts/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { auth, db } from "@/firebase/config";
import getRoles from "@/firebase/db/getRoles";
import Button from "@/components/general/button";
import ConnectedButton from "@/components/general/connectedButtons";

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
    <main className="flex flex-col gap-2 items-center w-9/12 ml-auto mr-auto max-sm:w-11/12">
      <h1 className="font-heading text-center text-8xl max-sm:text-7xl max-xs:text-6xl">
        Account
      </h1>
      <h1 className="text-xl font-bold font-heading">User Management</h1>
      <input
        type="text"
        placeholder="Search Users"
        className="bg-accent-200 p-2 rounded w-full placeholder:text-secondary-900 focus:outline-none"
        onChange={searchUsers}
      />
      {isAdmin ? (
        <section className="w-full h-[35rem] rounded-xl overflow-y-scroll">
          <div className="grid grid-cols-3 gap-2 mt-2 overflow-y-scroll w-full items-center max-lg:grid-cols-2 max-sm:grid-cols-1">
            {filteredUserList.map((user: any) => (
              <div
                key={user.uid}
                className="border-t-2 border-secondary-400 hover:drop-shadow rounded-t-lg rounded-b-lg bg-accent-100 p-2 rounded-none h-56 transition-all duration-200 ease-in-out flex flex-col justify-between"
              >
                <div>
                  <h2 className="px-1">{user.name}</h2>
                  <p className="px-1">{user.email}</p>
                </div>
                <section className="flex w-full gap-2 mt-2">
                  {isAdmin ? (
                    <div className="w-full">
                      <p className="bg-secondary-100 text-center p-1 rounded-t">
                        {user.isHelper ? "Helper" : "Not Helper"}
                      </p>
                      <Button
                        onClick={() => updateUsersHelperStatus(user)}
                        title={user.isHelper ? "Remove" : "Add"}
                        style={user.isHelper ? "red" : "green"}
                        classModifier="rounded-t-none rounded-b !p-1"
                      />
                    </div>
                  ) : null}
                  {isMaksim ? (
                    <div className="w-full">
                      <p className="bg-secondary-100 text-center p-1 rounded-tl-lg rounded-tr-lg">
                        {user.isAdmin ? "Admin" : "Not Admin"}
                      </p>
                      <Button
                        onClick={() => updateUsersAdminStatus(user)}
                        title={user.isAdmin ? "Remove" : "Add"}
                        style={user.isAdmin ? "red" : "green"}
                        classModifier="rounded-t-none rounded-b !p-1"
                      />
                    </div>
                  ) : null}
                </section>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      <Button
        onClick={startDeleteWorkflow}
        title="Delete Account"
        style="red"
        classModifier="p-5 text-lg"
      />
      {confirmDeletePopup ? (
        <section className="fixed flex items-center justify-center left-0 top-0 w-full h-full bg-accent-900 bg-opacity-50">
          <div className="p-10 bg-background-50 rounded-xl">
            <p>Are you sure you want to delete your account?</p>
            <ConnectedButton
              leftStyle="red"
              rightStyle="normal"
              onClickLeft={deleteAccountHandler}
              onClickRight={stopDeleteWorkflow}
              leftTitle="Yes"
              rightTitle="No"
            />
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
