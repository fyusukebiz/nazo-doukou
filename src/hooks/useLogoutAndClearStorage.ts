import { useCallback } from "react";
import { signOut } from "next-auth/react";

export const useLogoutAndClearStorage = () => {
  const logoutAndClearStorage = useCallback(async () => {
    try {
      await signOut({ callbackUrl: "/events" });
    } catch (error) {
      console.error(error);
    }
  }, []);

  return { logoutAndClearStorage };
};
