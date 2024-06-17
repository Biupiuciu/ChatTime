import axios from "axios";
import { create } from "zustand";
interface ContactsState {
  unReadSet: Set<unknown | string>;
  handleUnReadClick: (
    deleteId: any,
    id: string | undefined,
    unReadSet: Set<unknown | string>
  ) => Promise<void>;
  getUnread: (
    contactId: string,
    id: string | undefined,
    handleUnReadClick: any
  ) => Promise<void>;
}
export const useContactsStore = create<ContactsState>((set) => ({
  unReadSet: new Set(),

  handleUnReadClick: async (
    deleteId: any,
    id: string | undefined,
    unReadSet: Set<unknown | string>
  ) => {
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
      set({ unReadSet: newSet });
    }
  },

  getUnread: async (
    contactId: string,
    id: string | undefined,
    handleUnReadClick
  ) => {
    try {
      console.log("TRYGET:", id);
      const response = await axios.post("/unread", { id: id });
      console.log(response.data);
      const newSet = new Set(response.data);
      //   console.log(contactId);
      //   console.log(newSet.has(contactId));
      if (newSet.has(contactId)) {
        handleUnReadClick(contactId);
      }
      set({ unReadSet: newSet });
    } catch (err) {
      console.log(err);
    }
  },
}));
