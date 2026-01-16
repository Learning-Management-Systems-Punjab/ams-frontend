import { useEffect } from "react";
import { useAppDispatch } from "../store/hooks";
import { hydrate } from "../store/slices/authSlice";
import type { User, UserProfile } from "../types";

export const useAuthInit = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    const profileStr = localStorage.getItem("profile");

    if (token && userStr && profileStr) {
      try {
        const user: User = JSON.parse(userStr);
        const profile: UserProfile = JSON.parse(profileStr);
        dispatch(hydrate({ user, profile, token }));
      } catch (error) {
        console.error("Failed to parse stored auth data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("profile");
      }
    }
  }, [dispatch]);
};
