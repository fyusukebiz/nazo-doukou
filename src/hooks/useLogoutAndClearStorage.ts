import { deleteCookie } from "cookies-next";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { toast } from "react-toastify";

export const useLogoutAndClearStorage = () => {
  const router = useRouter();
  const logoutAndClearStorage = useCallback(async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      deleteCookie("fbUid");
      toast.success("ログアウトしました");
      router.push("/auth/login");
    } catch (error) {
      console.error(error);
    }
  }, [router]);

  return { logoutAndClearStorage };
};
