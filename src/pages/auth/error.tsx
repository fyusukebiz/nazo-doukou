import { CustomCard } from "@/components/cards/CustomCard";
import { Box, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import { useRouter } from "next/router";

export default function ErrorPage() {
  const router = useRouter();
  const error = router.query.error;

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
        <Box sx={{ textAlign: "center" }}>
          {error === "Verification"
            ? "ログイン用のリンクは無効です。すでに使用されているか、有効期限が切れている可能性があります。"
            : "エラーが発生しました"}
        </Box>
      </CustomCard>
    </Box>
  );
}
