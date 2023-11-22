import { Box, Button, Divider, TextField } from "@mui/material";
import { grey } from "@mui/material/colors";
import { CustomCard } from "@/components/cards/CustomCard";
import { LoadingButton } from "@mui/lab";
import { useState } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { setCookie } from "cookies-next";
import { cookieOptions } from "@/constants/cookieOptions";
import { usePostConfirmMyUser } from "@/react_queries/my_user/usePostConfirmMyUser";
import Link from "next/link";
import { toast } from "react-toastify";
import { FirebaseError } from "firebase/app";
import { firebaseErrors } from "@/constants/firebaseErrors";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { postConfirmMyUser } = usePostConfirmMyUser();

  const handleClickLogin = async () => {
    setIsLoading(true);
    try {
      const auth = getAuth();

      // これを入れないと頻繁にログアウトさせられる
      // await setPersistence(auth, browserSessionPersistence); // TODO:

      // Firebaseで用意されているメールアドレスとパスワードでログインするための関数
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const fbUser = userCredential.user;
      const idToken = await fbUser.getIdToken();

      // TODO: FEでsetCookieすべきじゃない
      setCookie("currentFbUserIdToken", idToken, cookieOptions);

      // DBにちゃんとUserが存在しているか確認、存在していなければUserを作成
      // cookieをセット
      await postConfirmMyUser.mutateAsync();

      // router.push("/recruits");
      window.location.href = "/recruits";
    } catch (error) {
      if (error instanceof FirebaseError) {
        toast.error(firebaseErrors[error.code]);
      } else {
        toast.error("ログインに失敗しました");
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
            ログイン
          </Box>
          <TextField
            name="email"
            type="email"
            placeholder="メールアドレス"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            name="password"
            type="password"
            placeholder="パスワード"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <LoadingButton
            color="teal"
            variant="contained"
            sx={{ height: "50px" }}
            onClick={handleClickLogin}
            loading={isLoading}
          >
            ログイン
          </LoadingButton>
        </Box>

        <Divider sx={{ my: "20px" }} />
        <Link
          href="/auth/forgot_password"
          style={{ textDecoration: "none" }}
          passHref
        >
          <Button
            color="teal"
            variant="outlined"
            sx={{ height: "50px" }}
            fullWidth
          >
            パスワードを忘れた場合
          </Button>
        </Link>

        {/* <LoadingButton
          variant="outlined"
          sx={{ borderColor: grey[400], height: 50, width: "100%" }}
          onClick={() =>
            signIn("google", {
              callbackUrl: `${process.env.NEXT_PUBLIC_HOST}/videos`,
            })
          }
        >
          <Image
            src="/google_icon.png"
            alt="Google Icon"
            width={20}
            height={20}
            style={{ marginRight: "10px" }}
          />
          <Typography>Googleでログイン</Typography>
        </LoadingButton> */}
      </CustomCard>
    </Box>
  );
};
