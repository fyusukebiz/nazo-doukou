import { Box } from "@mui/material";
import { grey } from "@mui/material/colors";
import { useRouter } from "next/router";

export const PcTopBar = () => {
  const router = useRouter();
  const pathname = router.pathname;

  return (
    <Box
      sx={{
        height: "100%",
        borderBottom: "1px solid",
        borderColor: grey[400],
        display: "flex",
        alignItems: "center",
        paddingX: "20px",
      }}
    >
      <Box component="h1" sx={{ fontSize: "20px" }}>
        {/^\/admin/.test(pathname)
          ? "【管理画面】" + process.env.NEXT_PUBLIC_SERVICE_NAME
          : process.env.NEXT_PUBLIC_SERVICE_NAME}
      </Box>
    </Box>
  );
};
