import { Box, Divider, TextField, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import { CustomCard } from "@/components/cards/CustomCard";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { LoadingButton } from "@mui/lab";

type Props = {
  csrfToken: string | undefined;
};

export const Login = (props: Props) => {
  const { csrfToken } = props;

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
          component={"form"}
          sx={{ display: "flex", flexDirection: "column", gap: "20px" }}
          method="post"
          action="/api/auth/signin/email"
        >
          <Box sx={{ margin: "auto" }}>
            <Image
              src="/service_logo.png"
              alt="ロゴ"
              width={150}
              height={150}
              style={{ borderRadius: "10px" }}
            />
          </Box>
          <Typography
            variant="h5"
            component="h1"
            gutterBottom
            sx={{ mx: "auto" }}
          >
            {process.env.NEXT_PUBLIC_SERVICE_NAME}
          </Typography>
          <TextField
            name="email"
            id="email"
            type="email"
            placeholder="メールアドレス"
          />
          <input name="csrfToken" type="hidden" defaultValue={csrfToken} />

          <LoadingButton
            type="submit"
            variant="contained"
            sx={{ height: "50px" }}
          >
            ログイン用のメールを送信
          </LoadingButton>
        </Box>

        <Divider sx={{ my: "20px" }} />

        <LoadingButton
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
        </LoadingButton>
      </CustomCard>
    </Box>
  );
};
