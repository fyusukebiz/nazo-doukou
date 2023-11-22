import { useLogout } from "@/react_queries/auth/useLogout";
import { deleteCookie } from "cookies-next";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { toast } from "react-toastify";

export const useLogoutAndClearStorage = () => {
  const router = useRouter();
  const { refetch: refetchLogout } = useLogout();

  const logoutAndClearStorage = useCallback(async () => {
    try {
      const auth = getAuth();
      await signOut(auth); // firebaseでログアウト
      deleteCookie("fbUid"); // TODO: BE側で実装する
      await refetchLogout(); // サーバー側でクッキーを消しに行く
      sessionStorage.clear();
      toast.success("ログアウトしました");
      router.push("/auth/login");
    } catch (error) {
      console.error(error);
    }
  }, [router, refetchLogout]);

  return { logoutAndClearStorage };
};
