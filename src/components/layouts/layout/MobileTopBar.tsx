import { useFirebaseAuthContext } from "@/components/providers/FirebaseAuthProvider";
import { Box, Button, MenuItem } from "@mui/material";
import { grey } from "@mui/material/colors";
import { useRouter } from "next/router";
import Link from "next/link";
import { useLogoutAndClearStorage } from "@/hooks/useLogoutAndClearStorage";
import { MenuButton, MenuButtonHandler } from "../../buttons/MenuButton";
import { useRef } from "react";

export const MobileTopBar = () => {
  const router = useRouter();
  const menuRef = useRef<MenuButtonHandler>(null);
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
      <Link href="/recruits" style={{ textDecoration: "none" }} passHref>
        <Button
          component="h1"
          sx={{ fontSize: "24px", color: "black", fontWeight: "bold" }}
        >
          {/^\/admin/.test(pathname) ? (
            "【管理画面】"
          ) : (
            <img
              src="/service_logo.png"
              alt="service_logo"
              style={{ height: "50px" }}
            />
          )}
        </Button>
      </Link>

      {typeof currentFbUser === "undefined" ? null : currentFbUser ? (
        currentFbUser.emailVerified ? (
          <Box sx={{ marginLeft: "auto" }}>
            <MenuButton ref={menuRef}>
              {/* <MenuItem
                sx={{ fontSize: "20px" }}
                onClick={() => {
                  router.push("/recruits/new");
                  menuRef.current?.closeMenu();
                }}
              >
                新規募集
              </MenuItem> */}
              <MenuItem
                sx={{ fontSize: "20px" }}
                onClick={() => {
                  router.push("/my_recruits");
                  menuRef.current?.closeMenu();
                }}
              >
                マイ募集
              </MenuItem>
              <MenuItem
                sx={{ fontSize: "20px" }}
                onClick={() => {
                  router.push("/my_user");
                  menuRef.current?.closeMenu();
                }}
              >
                プロフィール
              </MenuItem>
              <MenuItem
                sx={{ fontSize: "20px" }}
                onClick={() => {
                  logoutAndClearStorage();
                  menuRef.current?.closeMenu();
                }}
              >
                ログアウト
              </MenuItem>
            </MenuButton>
          </Box>
        ) : (
          <Link
            href="/auth/login"
            style={{ textDecoration: "none", marginLeft: "auto" }}
            passHref
          >
            <Button
              color="teal"
              variant="outlined"
              size="large"
              sx={{ width: "80px", paddingX: "0px" }}
            >
              ログイン
            </Button>
          </Link>
        )
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
            <Button
              color="teal"
              variant="contained"
              size="large"
              sx={{ width: "80px", paddingX: "0px" }}
            >
              登録
            </Button>
          </Link>
          <Link href="/auth/login" style={{ textDecoration: "none" }} passHref>
            <Button
              color="teal"
              variant="outlined"
              size="large"
              sx={{ width: "80px", paddingX: "0px" }}
            >
              ログイン
            </Button>
          </Link>
        </Box>
      )}
    </Box>
  );
};
