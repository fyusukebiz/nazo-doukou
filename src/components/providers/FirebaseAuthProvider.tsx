import React, {
  useContext,
  useState,
  useEffect,
  createContext,
  ReactNode,
} from "react";
import { Unsubscribe, User, getAuth, onAuthStateChanged } from "firebase/auth";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { cookieOptions } from "@/constants/cookieOptions";

// null：ログインしてない
// undefined: ログインしてるかしてないかわからない初期状態
type FirebaseAuthContextProps = {
  currentFbUser: User | null | undefined;
};

// コンテキストを作成
const FirebaseAuthContext = createContext<FirebaseAuthContextProps>(
  {} as FirebaseAuthContextProps
);

export const useFirebaseAuthContext = () => useContext(FirebaseAuthContext);

type Props = {
  children: ReactNode;
};

export const FirebaseAuthProvider = ({ children }: Props) => {
  const [currentFbUser, setCurrentFbUser] = useState<User | null | undefined>(
    undefined
  );

  // 第2引数に[]を指定して、初回レンダリングのみ関数を実行させる
  useEffect(() => {
    // onAuthStateChangedでログインの状態を監視する
    let unsubscribe: Unsubscribe | undefined;
    try {
      const auth = getAuth();
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        // console.log("user", user);
        setCurrentFbUser(user);

        if (user) {
          const idToken = await user.getIdToken();
          const currentIdTooken = getCookie("currentFbUserIdToken");
          if (currentIdTooken !== idToken) {
            // TODO: FEでsetCookieすべきじゃない
            setCookie("currentFbUserIdToken", idToken, cookieOptions);
          }
        } else {
          deleteCookie("currentFbUserIdToken");
        }
      });
    } catch (error) {
      setCurrentFbUser(undefined);
      throw error;
    }

    return unsubscribe;
  }, []);

  return (
    <FirebaseAuthContext.Provider value={{ currentFbUser }}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};
