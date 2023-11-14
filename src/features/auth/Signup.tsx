import { LoadingButton } from "@mui/lab";
import { Box, TextField } from "@mui/material";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { setCookie } from "cookies-next";
import { cookieOptions } from "@/constants/cookieOptions";
import { useRouter } from "next/router";
import { usePostMyUser } from "@/react_queries/my_user/usePostMyUser";
import { CustomCard } from "@/components/cards/CustomCard";
import { grey } from "@mui/material/colors";
import { FirebaseError } from "firebase/app";
import { firebaseErrors } from "@/constants/firebaseErrors";
import { useFirebaseAuthContext } from "@/components/providers/FirebaseAuthProvider";

export const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { currentFbUser } = useFirebaseAuthContext();
  const { postMyUser } = usePostMyUser();

  useEffect(() => {
    if (!!currentFbUser && currentFbUser.emailVerified) {
      router.push("/recruits");
    }
  }, [currentFbUser, router]);

  // ユーザーが登録ボタンを押したときにdoRegister関数が実行される
  const handleClickRegister = async () => {
    const auth = getAuth();
    setIsLoading(true);

    // TODO: パスワードの強度のバリデーション必須

    // Firebaseで用意されているユーザー登録の関数
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      // ユーザー登録すると自動的にログインされてuserCredential.userでユーザーの情報を取得できる
      const fbUser = userCredential.user;
      const idToken = await fbUser.getIdToken();

      // TODO: FEでsetCookieすべきじゃない
      setCookie("currentFbUserIdToken", idToken, cookieOptions);

      // DBにUserを作成する
      // cookieをセット
      await postMyUser.mutateAsync({ body: { user: { name } } });

      // 認証用のメールを送る
      await sendEmailVerification(userCredential.user);

      router.push("/auth/verify");
    } catch (error) {
      // console.log(error);
      if (error instanceof FirebaseError) {
        // console.log(error.code);
        toast.error(firebaseErrors[error.code]);
      } else {
        toast.error("登録に失敗しました");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: grey[50],
        height: "100%",
        px: "10px",
        backgroundImage: "url(/auth_background.png)",
      }}
    >
      <CustomCard sx={{ maxWidth: "350px", opacity: 0.8 }}>
        <Box
          component="form"
          sx={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <img
            src="/service_logo.png"
            alt="service_logo"
            style={{ height: "100px", objectFit: "contain" }}
          />
          <Box
            sx={{
              fontSize: "28px",
              textAlign: "center",
              fontWeight: "bold",
              paddingTop: "30px",
            }}
          >
            新規登録
          </Box>
          <TextField
            name="name"
            type="text"
            placeholder="ユーザー名"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            name="email"
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            name="passowrd"
            type="passowrd"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <LoadingButton
            color="teal"
            variant="contained"
            sx={{ height: "50px" }}
            onClick={handleClickRegister}
            loading={isLoading}
          >
            登録
          </LoadingButton>
        </Box>
      </CustomCard>
    </Box>
  );
};
