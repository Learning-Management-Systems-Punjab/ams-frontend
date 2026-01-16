import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, User, UserProfile } from "../../types";

const initialState: AuthState = {
  user: null,
  profile: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; profile: UserProfile; token: string }>
    ) => {
      state.user = action.payload.user;
      state.profile = action.payload.profile;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.profile = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("profile");
    },
    hydrate: (
      state,
      action: PayloadAction<{ user: User; profile: UserProfile; token: string }>
    ) => {
      state.user = action.payload.user;
      state.profile = action.payload.profile;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
  },
});

export const { setCredentials, setLoading, logout, hydrate } =
  authSlice.actions;
export default authSlice.reducer;
