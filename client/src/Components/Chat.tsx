import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "../main";
import { uniqBy } from "lodash";
import { useEffect, useState, useRef } from "react";
import { Contactselection } from "./Contactselection";
import { LOGOUT } from "../feature/user";
import { Offlineselection } from "./Offlineselection";
import noContactImg from "../assets/comments on internet.png";
import axios from "axios";
export const Chat = () => {
  const divUnderMessages = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const [webso, setWebSo] = useState<WebSocket | null>();
  const [onlineUsers, setOnlineUsers] = useState<any>({});
  const [offlineUsers, setOfflineUsers] = useState([]);
  const [contactId, setContactId] = useState<any>("");
  const [message, setMessage] = useState("");
  const [allMessages, setallMessages] = useState([{}]);
  const [isLogout, setIsLogout] = useState(false);
  const [unReadSet, setunReadSet] = useState(new Set());
  const user = useSelector((state: IRootState) => {
    return state.user;
  });
  const { username, id } = user.user;
  const isLogIn = user.isLogIn;
  const setOnlineContacts = (contactList: Array<Object>) => {
    const people: any = {};
    contactList.forEach(({ userId, username }: any) => {
      if (userId) {
        people[userId] = username;
      }
    });

    setOnlineUsers(people);
  };

  const handleMessage = (event: any, contact: any) => {
    const message = JSON.parse(event.data);

    if ("online" in message) {
      setOnlineContacts(message.online);
    } else if ("text" in message) {
      //console.log(event, message);
      // console.log(message.sender, " ", contact);
      // if (message.sender == contact) {
      //   console.log("added1");
      //   setallMessages((prev) => [...prev, { ...message }]);
      // }
      //console.log(contact);
      console.log("MESSAGE GET!");
      getUnread();
    }
  };

  const sendMessage = (event: any) => {
    event.preventDefault();
    webso?.send(
      JSON.stringify({
        contact: contactId,
        text: message,
      })
    );

    setallMessages((prev) => [
      ...prev,
      {
        text: message,
        sender: id,
        contact: contactId,
        _id: Date.now().toString(),
      },
    ]);
    setMessage("");
  };

  const handleLogOut = async () => {
    await axios.post("/logout").then((response) => {
      if (response.data === "ok") {
        setIsLogout(true);
        console.log("? ", isLogout);
        setWebSo(null);
        webso?.close();

        //dispatch(LOGOUT());
      }
    });
  };

  const getUnread = async () => {
    try {
      console.log("TRYGET:", id);
      const response = await axios.post("/unread", { id: id });
      console.log(response.data);
      const newSet = new Set(response.data);
      console.log(newSet);
      setunReadSet(newSet);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    //console.log("effect");
    connectToWs(contactId);
    getUnread();
  }, []);

  useEffect(() => {
    const div = divUnderMessages.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [allMessages]);

  useEffect(() => {
    if (unReadSet.has(contactId)) {
      handleUnReadClick(contactId);
      getUnread();
      console.log("del");

      //update message
      axios.get("/message/" + contactId).then((result) => {
        setallMessages(result.data);
      });
    }
  }, [unReadSet]);

  const handleUnReadClick = async (deleteId: any) => {
    try {
      await axios.delete("/read", { params: { id: id, deleteId: deleteId } });
    } catch (err) {
      console.log(err);
    } finally {
      const newSet = new Set(unReadSet);
      newSet.delete(deleteId);
      setunReadSet(newSet);
    }
  };

  const handleClose = () => {
    setTimeout(() => {
      console.log("logout? ", isLogout);
      if (isLogout) {
        console.log(isLogIn, "Disconnected. Trying to reconnect.");
        connectToWs(contactId);
      }
    }, 5000);
  };

  const connectToWs = (contactId: any) => {
    console.log("ws");
    const ws = new WebSocket(import.meta.env.VITE_API_URL);
    console.log("ws1");
    setWebSo(ws);
    console.log("ws2");
    ws.addEventListener("message", (event) => handleMessage(event, contactId));
    //reconnect
    ws.addEventListener("close", handleClose);
  };
  //get history chat messages
  useEffect(() => {
    if (contactId) {
      axios.get("/message/" + contactId).then((result) => {
        setallMessages(result.data);
      });
    }
  }, [contactId]);

  //logout remove listener
  useEffect(() => {
    console.log(isLogout, " 11");
    if (isLogout) {
      webso?.removeEventListener("close", handleClose);
      setWebSo(null);
      webso?.close();
      dispatch(LOGOUT());
    }
  }, [isLogout]);

  useEffect(() => {
    axios.get("/people").then((result) => {
      const notOnlineList = result.data
        .filter((user: any) => user._id !== id)
        .filter((user: any) => !Object.keys(onlineUsers).includes(user._id));
      setOfflineUsers(notOnlineList);
    });
  }, [onlineUsers]);

  const onlinePeopleExclUser = { ...onlineUsers };

  if (id) {
    delete onlinePeopleExclUser[id];
  }

  const noDupMessages = uniqBy(allMessages, "_id");
  const ShowMessage = noDupMessages.map((message) => {
    if (message) {
      if (
        "text" in message &&
        "_id" in message &&
        "sender" in message &&
        "contact" in message
      ) {
        const { text, _id, sender } = message;
        const isSender = sender === id;

        if (typeof text === "string" && typeof _id === "string") {
          return (
            <div
              key={_id}
              className={`my-2 ${isSender ? "text-right " : "text-left"} `}
            >
              <div
                className={` ${isSender ? "bg-lime-200   " : "bg-red-200 "}
                } py-3 px-4 inline-block rounded-xl max-w-56 xl:max-w-96 whitespace-normal break-words`}
              >
                {text}
              </div>
            </div>
          );
        }
      }
    }
  });

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
          <div className="  absolute overflow-y-scroll right-4 left-4 bottom-4 top-4 ">
            {Object.keys(onlinePeopleExclUser).map((userId) => {
              const selected = contactId === userId;
              return (
                <div
                  key={userId}
                  className={`my-2 mr-4 px-4 py-7 flex h-20 items-center text-md 
                ${selected && "rounded-2xl bg-lime-100"}`}
                  onClick={() => {
                    console.log("pre:", contactId);
                    setContactId(userId);
                    if (unReadSet.has(userId)) {
                      handleUnReadClick(userId);
                    }
                  }}
                >
                  <Contactselection
                    username={onlinePeopleExclUser[userId]}
                    userId={userId}
                    isSelected={selected}
                    unread={unReadSet}
                  ></Contactselection>
                </div>
              );
            })}
            {offlineUsers.map((user: any) => {
              const selected = contactId === user._id;
              return (
                <div
                  key={user._id}
                  className={`my-2 px-4 py-7 flex h-20 items-center text-md 
                ${selected && "rounded-2xl bg-lime-100"}`}
                  onClick={() => {
                    console.log("pre:", contactId);
                    setContactId(user._id);

                    if (unReadSet.has(user._id)) {
                      handleUnReadClick(user._id);
                    }
                  }}
                >
                  <Offlineselection
                    username={user.username}
                    userId={user._id}
                    isSelected={selected}
                    unread={unReadSet}
                  ></Offlineselection>
                </div>
              );
            })}
          </div>
        </div>

        {contactId ? (
          <div className=" w-full h-full col-span-5 bg-stone-50  border-l p-4 flex flex-col">
            <div className="w-full border-b pb-4 pl-4 text-xl">
              {onlineUsers[contactId] ||
                offlineUsers.map((user: any) => {
                  if (user._id == contactId) return user.username;
                })}
            </div>

            <div className="w-full relative h-full grow">
              <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-4 px-4">
                {ShowMessage}

                <div ref={divUnderMessages}></div>
              </div>
            </div>
            <form className="w-full border-t h-12 flex pt-4">
              <div className="grow  mx-3 self-center border-none outline-none">
                <input
                  type="text"
                  placeholder="Message..."
                  value={message}
                  onChange={(e: any) => setMessage(e.target.value)}
                  className="w-full self-center border-none outline-none bg-transparent"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && message) {
                      sendMessage(event);
                    }
                  }}
                />
                <input type="text" className="hidden" />
              </div>
              <div
                className="self-center py-2 px-4 bg-lime-200 rounded-xl hover:bg-lime-300"
                onClick={sendMessage}
              >
                Send
              </div>
            </form>
          </div>
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
