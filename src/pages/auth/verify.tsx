import { CustomCard } from "@/components/cards/CustomCard";
import { Layout } from "@/components/layouts/layout/Layout";
import { Box, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import { NextPageWithLayout } from "../_app";

const VerifyPage: NextPageWithLayout = () => {
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
        <Typography sx={{ textAlign: "center" }}>
          メールに認証用リンクを送信しました。
          <br />
          迷惑メールボックスもご確認ください。
        </Typography>
      </CustomCard>
    </Box>
  );
};

VerifyPage.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

export default VerifyPage;
