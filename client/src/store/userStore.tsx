import { create } from "zustand";
interface UserInfo {
  id?: string;
  username?: string;
}

export interface User {
  isLogIn: boolean;
  user: UserInfo;
  LOGOUT: () => void;
  LOGIN: (info: UserInfo) => void;
}

export const useUserStore = create<User>((set) => ({
  isLogIn: false,
  user: { username: "", id: "" },
  LOGIN: (info: UserInfo) => set({ isLogIn: true, user: { ...info } }),
  LOGOUT: () => set({ isLogIn: false, user: { username: "", id: "" } }),
}));
