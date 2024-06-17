import axios from "axios";
import { create } from "zustand";

interface Message {
  _id: string;
  text: string;
  sender: string;
  contact: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface MessagesState {
  allMessages: Message[];
  getNewMessage: (contactId: string) => void;
  getAllMessages: (newContactId: string) => void;
}

export const useChatStore = create<MessagesState>((set) => ({
  allMessages: [],

  getNewMessage: (contactId: string) => {
    console.log("CONTACT ID:", contactId);
    axios.get("/message/" + contactId).then((result) => {
      set({
        allMessages: result.data,
      });
    });
  },
  getAllMessages: (newContactId: string) => {
    console.log("Get ID:", newContactId);
    axios.get("/message/" + newContactId).then((result) => {
      set({
        allMessages: result.data,
      });
    });
  },
}));
