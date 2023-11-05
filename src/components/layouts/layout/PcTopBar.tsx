import { useLogoutAndClearStorage } from "@/hooks/useLogoutAndClearStorage";
import { Box, Button } from "@mui/material";
import { grey } from "@mui/material/colors";
import { useRouter } from "next/router";
import Link from "next/link";
import { useFirebaseAuthContext } from "@/components/providers/FirebaseAuthProvider";

export const PcTopBar = () => {
  const router = useRouter();
  const pathname = router.pathname;
  const { currentFbUser } = useFirebaseAuthContext();
  const { logoutAndClearStorage } = useLogoutAndClearStorage();

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

      {currentFbUser ? (
        <Box
          sx={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <Link
            href="/admin/events"
            style={{ textDecoration: "none" }}
            passHref
          >
            <Button variant="contained" size="large" sx={{ width: "110px" }}>
              管理
            </Button>
          </Link>
          <Button
            variant="outlined"
            sx={{ marginLeft: "auto" }}
            onClick={logoutAndClearStorage}
          >
            ログアウト
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <Link href="/auth/signup" style={{ textDecoration: "none" }} passHref>
            <Button variant="contained" size="large" sx={{ width: "110px" }}>
              登録
            </Button>
          </Link>
          <Link href="/auth/login" style={{ textDecoration: "none" }} passHref>
            <Button variant="outlined" size="large" sx={{ width: "110px" }}>
              ログイン
            </Button>
          </Link>
        </Box>
      )}
    </Box>
  );
};
