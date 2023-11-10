import { Box, Button, Divider, TextField, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import { CustomCard } from "@/components/cards/CustomCard";
import Image from "next/image";
import { LoadingButton } from "@mui/lab";
import { useState } from "react";
import { useRouter } from "next/router";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
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
  const router = useRouter();

  const { postConfirmMyUser } = usePostConfirmMyUser();

  const handleClickLogin = async () => {
    setIsLoading(true);
    try {
      const auth = getAuth();

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

      router.push("/recruits");
    } catch (error) {
      console.log(error);
      if (error instanceof FirebaseError) {
        console.log(error.code);
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
            ログイン
          </Box>
          <TextField
            name="email"
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            name="password"
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <LoadingButton
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
          <Button variant="outlined" sx={{ height: "50px" }} fullWidth>
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
