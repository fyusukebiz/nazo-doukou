import { LoadingButton } from "@mui/lab";
import { Box, TextField } from "@mui/material";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { useState } from "react";
import { toast } from "react-toastify";
import { setCookie } from "cookies-next";
import { cookieOptions } from "@/constants/cookieOptions";
import { useRouter } from "next/router";
import { usePostMyUser } from "@/react_queries/my_user/usePostMyUser";
import { CustomCard } from "@/components/cards/CustomCard";
import { grey } from "@mui/material/colors";
import { FirebaseError } from "firebase/app";
import { firebaseErrors } from "@/constants/firebaseErrors";

export const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { postMyUser } = usePostMyUser();

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
      console.log(error);
      if (error instanceof FirebaseError) {
        console.log(error.code);
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
      }}
    >
      <CustomCard sx={{ maxWidth: "350px" }}>
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
              fontSize: "32px",
              textAlign: "center",
              fontWeight: "bold",
              paddingY: "10px",
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
