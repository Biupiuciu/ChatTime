import axios from "axios";
import { useState, useEffect } from "react";

import { Contact } from "./Contact";
import { useContactsStore } from "../store/contactsStore";
import { useUserStore } from "../store/userStore";
export const Contacts = (props: any) => {
  const { contactId, contactList, openChatUser } = props;
  const { unReadSet, getUnread, handleUnReadClick } = useContactsStore(
    (state) => state
  );
  const { user } = useUserStore((state) => state);

  const { id } = user;

  const list: any = [{ isOnline: true }, { isOnline: false }];

  const [offlineContacts, setOfflineUsers] = useState([]);

  contactList.forEach(({ userId, username }: any) => {
    if (userId) {
      list[0][userId] = username;
    }
  });

  offlineContacts.forEach((user: any) => {
    if (!Object.keys(list[0]).includes(user._id)) {
      list[1][user._id] = user.username;
    }
  });

  //get offline list
  useEffect(() => {
    getUnread(contactId, id, handleUnReadClick);
    axios.get("/people").then((result) => {
      const otherUsers = result.data.filter((user: any) => user._id !== id);
      setOfflineUsers(otherUsers);
    });
  }, []);

  return (
    <div className="  absolute overflow-y-scroll right-4 left-4 bottom-4 top-4 ">
      {list.map((list: any) => {
        return (
          <>
            {Object.keys(list).map((userId) => {
              if (userId != "isOnline" && userId != id) {
                const selected = contactId === userId;
                return (
                  <div
                    key={userId}
                    className={`my-2 mr-4 px-4 py-7 flex h-20 items-center text-md 
                     ${selected && "rounded-2xl bg-lime-100"}`}
                    onClick={() => {
                      openChatUser(userId, list[userId]);

                      if (unReadSet.has(userId)) {
                        handleUnReadClick(userId, id, unReadSet);
                      }
                    }}
                  >
                    <Contact
                      username={list[userId]}
                      userId={userId}
                      isSelected={selected}
                      isOnline={list.isOnline}
                      unread={unReadSet}
                    ></Contact>
                  </div>
                );
              }
            })}
          </>
        );
      })}
    </div>
  );
};
