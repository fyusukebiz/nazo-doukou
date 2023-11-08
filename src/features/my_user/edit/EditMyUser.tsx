import { Box, Container } from "@mui/material";
import { EditMyUserForm } from "./EditMyUserForm";
import { EditMyUserFormProvider } from "./EditMyUserFormProvider";
import { useMyUserQuery } from "@/react_queries/my_user/useMyUserQuery";
import { SubPageHeader } from "@/components/layouts/SubPageHeader";
import { LoadingSpinner } from "@/components/spinners/LoadingSpinner";

export const EditMyUser = () => {
  const { data: myUserData, status: myUserStatus } = useMyUserQuery();

  return (
    <Box sx={{ height: "100%", overflowY: "scroll" }}>
      <SubPageHeader title="プロフィール編集" />
      <Container maxWidth="sm" sx={{ paddingY: "24px", background: "white" }}>
        {myUserStatus === "pending" && <LoadingSpinner />}
        {myUserStatus === "success" && (
          <EditMyUserFormProvider myUser={myUserData.myUser}>
            <EditMyUserForm myUser={myUserData.myUser} />
          </EditMyUserFormProvider>
        )}
      </Container>
    </Box>
  );
};
