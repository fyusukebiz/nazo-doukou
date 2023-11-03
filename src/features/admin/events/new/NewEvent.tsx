import { Box, Button, Container } from "@mui/material";
import { NewEventFormProvider } from "./NewEventFormProvider";
import { NewEventForm } from "./NewEeventForm";
import { SubPageHeader } from "@/components/layouts/SubPageHeader";

export const NewEvent = () => {
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
      <SubPageHeader title="新規イベント作成" />
      <Container maxWidth="sm" sx={{ paddingY: "24px", background: "white" }}>
        <Box sx={{ display: "flex" }}>
          <Button variant="outlined" sx={{ marginLeft: "auto" }}>
            新規作成
          </Button>
        </Box>
        <NewEventFormProvider>
          <NewEventForm />
        </NewEventFormProvider>
      </Container>
    </Box>
  );
};
