import { Box, Container } from "@mui/material";
import { NewRecruitFormProvider } from "./NewRecruitFormProvider";
import { NewRecruitForm } from "./NewRecruitForm";
import { SubPageHeader } from "@/components/layouts/SubPageHeader";

export const NewRecruit = () => {
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
      <SubPageHeader title="新規募集作成" />
      <Container maxWidth="sm" sx={{ paddingY: "24px", background: "white" }}>
        <NewRecruitFormProvider>
          <NewRecruitForm />
        </NewRecruitFormProvider>
      </Container>
    </Box>
  );
};
