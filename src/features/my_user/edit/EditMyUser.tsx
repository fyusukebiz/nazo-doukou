import { Box, Button, Container, Paper, Typography } from "@mui/material";
import { EditMyUserForm } from "./EditMyUserForm";
import { EditMyUserFormProvider } from "./EditMyUserFormProvider";
import { useLogoutAndClearStorage } from "@/hooks/useLogoutAndClearStorage";
import { LoadingSpinner } from "@/components/spinners/LoadingSpinner";
import { PageHeader } from "@/components/layouts/PageHeader";
import { useFirebaseAuthContext } from "@/components/providers/FirebaseAuthProvider";

export const EditMyUser = () => {
  const { currentFbUser } = useFirebaseAuthContext();
  const { logoutAndClearStorage } = useLogoutAndClearStorage();

  return (
    <>
      {status === "loading" && <LoadingSpinner />}
      {status === "authenticated" && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            background: "#F0F0F0",
          }}
        >
          <PageHeader sx={{ height: "64px" }}>
            <Typography variant="h6">アカウント編集</Typography>
            <Button
              variant="outlined"
              sx={{ ml: "auto" }}
              onClick={logoutAndClearStorage}
            >
              ログアウト
            </Button>
          </PageHeader>
          <Container maxWidth="md" component={Paper} sx={{ p: 5, mt: 3 }}>
            <EditMyUserFormProvider>
              <EditMyUserForm />
            </EditMyUserFormProvider>
          </Container>
        </Box>
      )}
    </>
  );
};
