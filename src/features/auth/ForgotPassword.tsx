import { Box, TextField, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import { CustomCard } from "@/components/cards/CustomCard";
import { LoadingButton } from "@mui/lab";
import { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { toast } from "react-toastify";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleClickSend = async () => {
    setIsLoading(true);
    try {
      const auth = getAuth();

      const actionCodeSettings = {
        // パスワード再設定後にログイン画面にリダイレクトさせる
        url: `${process.env.NEXT_PUBLIC_HOST}/auth/login`,
        handleCodeInApp: false,
      };

      // TODO: 未登録のメールでも成功してしまう
      // Firebaseで用意されているパスワード再設定のメールを送るための関数
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      setEmail("");
      toast.success("再設定用のメールを送りました");
    } catch (error) {
      console.error(error);
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
          <Typography
            variant="h5"
            component="h1"
            gutterBottom
            sx={{ mx: "auto" }}
          >
            パスワード再設定
          </Typography>
          <TextField
            name="email"
            id="email"
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <LoadingButton
            type="submit"
            variant="contained"
            sx={{ height: "50px" }}
            onClick={handleClickSend}
            loading={isLoading}
          >
            送信
          </LoadingButton>
        </Box>
      </CustomCard>
    </Box>
  );
};
