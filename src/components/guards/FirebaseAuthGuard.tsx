import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { useFirebaseAuthContext } from "../providers/FirebaseAuthProvider";
import { Box } from "@mui/material";
import { LoadingSpinner } from "../spinners/LoadingSpinner";

type Props = {
  children: ReactNode;
};

export const FirebaseAuthGuard = ({ children }: Props) => {
  const { currentFbUser } = useFirebaseAuthContext();
  const router = useRouter();

  if (typeof currentFbUser === "undefined") {
    // Firebase Authからログイン情報がまだ帰ってきてない
    return <LoadingSpinner />;
  }

  if (currentFbUser === null) {
    // ログインしてない
    router.push("/auth/login");
    return null;
  }

  return <>{children}</>;
};
