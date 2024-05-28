import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { uniqBy } from "lodash";
import axios from "axios";
export const MessageWindow = forwardRef((props: any, ref) => {
  const { contactName, contactId, id, webso } = props;
  const [message, setMessage] = useState("");
  const [allmessages, setallmessages] = useState([{}]);
  const divUnderMessages = useRef<HTMLDivElement>(null);

  const getAllMessages = (newContactId: string) => {
    console.log("Get ID:", newContactId);
    axios.get("/message/" + newContactId).then((result) => {
      setallmessages(result.data);
    });
  };

  const getNewMessage = () => {
    console.log("CONTACT ID:", contactId);
    axios.get("/message/" + contactId).then((result) => {
      setallmessages(result.data);
    });
  };

  useImperativeHandle(ref, () => ({
    getAllMessages,
    getNewMessage,
  }));

  useEffect(() => {
    getAllMessages(contactId);
  }, []);

  //scroll to latest message
  if (divUnderMessages.current) {
    const div = divUnderMessages.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }

  const sendMessage = (event: any) => {
    console.log("send:", contactId, message);
    event.preventDefault();
    webso?.send(
      JSON.stringify({
        contact: contactId,
        text: message,
      })
    );

    getNewMessage();
    setMessage("");
  };

  useEffect(() => {
    const div = divUnderMessages.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [allmessages]);

  const noDupMessages = uniqBy(allmessages, "_id");

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
    <div className=" w-full h-full col-span-5 bg-stone-50  border-l p-4 flex flex-col">
      <div className="w-full border-b pb-4 pl-4 text-xl">{contactName}</div>

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
  );
});
