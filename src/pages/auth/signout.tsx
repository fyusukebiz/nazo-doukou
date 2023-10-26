import { CustomCard } from "@/components/cards/CustomCard";
import { Box, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";

export default function SignOutPage() {
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
        <Typography sx={{ textAlign: "center" }}>ログアウトしました</Typography>
      </CustomCard>
    </Box>
  );
}
