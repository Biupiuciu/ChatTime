import axios from "axios";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { IRootState } from "../main";
import { useSelector } from "react-redux";
import { Contact } from "./Contact";
export const Contacts = forwardRef((props: any, ref) => {
  const { contactId, contactList, openChatUser } = props;

  const user = useSelector((state: IRootState) => {
    return state.user;
  });
  const [unReadSet, setunReadSet] = useState(new Set());
  const { id } = user.user;

  const list: any = [{ isOnline: true }, { isOnline: false }];

  const [offlineContacts, setOfflineUsers] = useState([]);

  useImperativeHandle(ref, () => ({
    getUnread,
  }));

  contactList.forEach(({ userId, username }: any) => {
    if (userId) {
      list[0][userId] = username;
    }
  });

  const handleUnReadClick = async (deleteId: any) => {
    console.log("READ!");
    try {
      await axios.delete("/read", {
        params: { id: id, deleteId: deleteId },
      });
    } catch (err) {
      console.log(err);
    } finally {
      const newSet = new Set(unReadSet);
      newSet.delete(deleteId);
      setunReadSet(newSet);
    }
  };

  offlineContacts.forEach((user: any) => {
    if (!Object.keys(list[0]).includes(user._id)) {
      list[1][user._id] = user.username;
    }
  });

  const getUnread = async () => {
    try {
      console.log("TRYGET:", id);
      const response = await axios.post("/unread", { id: id });
      console.log(response.data);
      const newSet = new Set(response.data);
      console.log(contactId);
      console.log(newSet.has(contactId));
      if (newSet.has(contactId)) {
        handleUnReadClick(contactId);
      }
      setunReadSet(newSet);
    } catch (err) {
      console.log(err);
    }
  };

  //get offline list
  useEffect(() => {
    axios.get("/people").then((result) => {
      const otherUsers = result.data.filter((user: any) => user._id !== id);
      setOfflineUsers(otherUsers);
    });

    getUnread();
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
                        handleUnReadClick(userId);
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
});
