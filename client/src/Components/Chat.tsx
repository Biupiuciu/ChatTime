import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import { useEffect, useState } from "react";

import { Contacts } from "./Contacts";
import { MessageWindow } from "./MessageWindow";
import noContactImg from "../assets/comments on internet.png";
import { useChatStore } from "../store/chatStore";
import { useContactsStore } from "../store/contactsStore";
import { useUserStore } from "../store/userStore";

import { LogoutApi } from "../api/LogoutApi";
export const Chat = () => {
  const [webso, setWebSo] = useState<WebSocket | null>();
  const [contactId, setContactId] = useState<string>("");
  const [isOpenChatWindow, setIsOpenChatWindow] = useState(false);
  const [contactName, setContactName] = useState("");
  const [onlineContacts, setOnlineContacts] = useState([{}]);
  const { isLogIn, user, LOGOUT } = useUserStore((state) => state);

  const { username, id } = user;

  const { getAllMessages, getNewMessage } = useChatStore((state) => state);
  const { getUnread, handleUnReadClick, unReadSet } = useContactsStore(
    (state) => state
  );
  const handleDisconnection = () => {
    console.log("disconnected");
    setTimeout(() => {
      if (isLogIn) {
        console.log(isLogIn, "Disconnected. Trying to reconnect.");
        connectToWs();
      }
    }, 5000);
  };

  const handleMessage = (event: any) => {
    const message = JSON.parse(event.data);
    if ("online" in message) {
      setOnlineContacts(message.online);
    } else if ("text" in message) {
      getNewMessage(contactId);
      getUnread(contactId, id, handleUnReadClick);
      console.log("MESSAGE GET!");
    }
  };
  const connectToWs = () => {
    const ws = new WebSocket(import.meta.env.VITE_API_URL);

    setWebSo(ws);

    ws.addEventListener("message", (event) => handleMessage(event));
    //reconnect
    ws.addEventListener("close", handleDisconnection);
  };

  // Initial Connection
  useEffect(() => {
    connectToWs();

    return () => {
      closeWebsocket();
    };
  }, []);

  const openChatUser = (newContactId: string, newContactName: string) => {
    if (!isOpenChatWindow) {
      setIsOpenChatWindow(true);
    }
    setContactId(newContactId);
    setContactName(newContactName);
    getAllMessages(newContactId);
  };

  const closeWebsocket = () => {
    webso?.removeEventListener("close", handleDisconnection);
    setWebSo(null);
    webso?.close();
  };

  const handleLogOut = async () => {
    const response = await LogoutApi.Logout({});
    if (response.data === "ok") {
      closeWebsocket();
      LOGOUT();
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col">
      <div className="p-4 border-b flex">
        <h2 className="font-semibold grow text-3xl">Chat</h2>
        <div className="self-center mx-6 flex gap-1">
          <AccountCircleIcon />
          {username}
        </div>
        <h2 className="self-center hover:text-lime-300" onClick={handleLogOut}>
          Log out
        </h2>
      </div>
      <div className="grow grid grid-cols-7 ">
        <div className="h-full col-span-2 p-6 relative">
          <Contacts
            contactId={contactId}
            openChatUser={openChatUser}
            contactList={onlineContacts}
          ></Contacts>
        </div>
        {isOpenChatWindow ? (
          <MessageWindow
            contactName={contactName}
            contactId={contactId}
            id={id}
            webso={webso}
          ></MessageWindow>
        ) : (
          <div className=" w-full h-full col-span-5 bg-stone-50  border-l  grid grid-rows-5">
            <div className="  row-span-1"></div>
            <div className="row-span-2 relative">
              <img
                src={noContactImg}
                alt=""
                className=" absolute h-full left-1/2 -translate-x-1/2"
              />
            </div>
            <div className="row-span-2 text-center pt-8">
              <h2 className="pb-1">Let's start a conversation!</h2>
              <h2>You never know what amazing connections you'll make!</h2>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
