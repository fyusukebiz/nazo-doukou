import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

// .envファイルで設定した環境変数をfirebaseConfigに入れる
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_APIKEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTHDOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECTID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APPID,
};

export const app = initializeApp(firebaseConfig);

export const initializeFirebaseApp = () => {
  // サーバーサイドでレンダリングするときにエラーが起きないようにするための記述
  if (typeof window !== "undefined" && !getApps().length) {
    const firebaseApp = initializeApp(firebaseConfig);
    const auth = getAuth(firebaseApp);
  }
};

// https://cloud.google.com/identity-platform/docs/use-rest-api?hl=ja#section-get-account-info
export const verifyIdToken = async (idToken: string) => {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_APIKEY;
  const body = JSON.stringify({ idToken });
  return await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    }
  );
};
