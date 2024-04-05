import { createSlice } from "@reduxjs/toolkit";

export interface User {
  isLogIn: boolean;
  user: {
    username?: string;
    id?: string;
  };
}
const initialState: User = {
  isLogIn: false,
  user: { username: "", id: "" },
};
export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    LOGIN: (state, action) => {
      state.isLogIn = true;
      state.user = action.payload;
    },
    LOGOUT: () => {
      return { ...initialState };
    },
  },
});

export const { LOGIN, LOGOUT } = userSlice.actions;

export default userSlice.reducer;
