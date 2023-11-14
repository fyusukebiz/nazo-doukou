import { Box, Container } from "@mui/material";
import { NewAdminRecruitFormProvider } from "./NewAdminRecruitFormProvider";
import { NewAdminRecruitForm } from "./NewAdminRecruitForm";
import { SubPageHeader } from "@/components/layouts/SubPageHeader";

export const NewAdminRecruit = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#F0F0F0",
        overflowY: "scroll",
      }}
    >
      <SubPageHeader title="新規募集作成 by 管理側" />
      <Container maxWidth="sm" sx={{ paddingY: "24px", background: "white" }}>
        <NewAdminRecruitFormProvider>
          <NewAdminRecruitForm />
        </NewAdminRecruitFormProvider>
      </Container>
    </Box>
  );
};
