import { Box, Container } from "@mui/material";
import { EditEventFormProvider } from "./EditEventFormProvider";
import { EditEventForm } from "./EditEeventForm";
import { SubPageHeader } from "@/components/layouts/SubPageHeader";
import { useEventQueryByAdmin } from "@/react_queries/admin/events/useEventQueryByAdmin";
import { useRouter } from "next/router";

export const EditEvent = () => {
  const router = useRouter();
  const eventId = router.query.id as string;
  const { data: eventData, status: eventStatus } = useEventQueryByAdmin({
    path: { eventId },
  });

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
      {eventStatus === "success" && (
        <>
          <SubPageHeader title={`${eventData.event.name} 編集`} />
          <Container
            maxWidth="sm"
            sx={{ paddingY: "24px", background: "white" }}
          >
            <EditEventFormProvider event={eventData.event}>
              <EditEventForm eventId={eventId} />
            </EditEventFormProvider>
          </Container>
        </>
      )}
    </Box>
  );
};
