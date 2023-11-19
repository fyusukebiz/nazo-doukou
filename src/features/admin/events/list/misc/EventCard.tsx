import { Box } from "@mui/material";
import { grey } from "@mui/material/colors";
import { useRouter } from "next/router";
import { EventSimple } from "@/types/event";

type Props = {
  event: EventSimple;
  saveScrollPosition?: () => void;
};

export const EventCard = (props: Props) => {
  const { event, saveScrollPosition } = props;
  const router = useRouter();

  const handleClickCard = () => {
    if (!saveScrollPosition) return;
    saveScrollPosition();
    router.push(`/admin/events/${event.id}/edit`);
  };

  return (
    <Box sx={{ border: `1px solid ${grey[300]}`, borderRadius: "10px" }}>
      {event.coverImageFileUrl ? (
        <img
          src={event.coverImageFileUrl}
          style={{
            objectFit: "cover",
            maxHeight: "220px",
            minHeight: "90px",
            width: "100%",
            marginBottom: "8px",
            cursor: "pointer",
            borderRadius: "10px",
          }}
          onClick={handleClickCard}
          alt="image"
          loading="lazy"
        />
      ) : (
        <Box
          sx={{
            height: "220px",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "8px",
            cursor: "pointer",
            borderRadius: "10px",
            backgroundColor: grey[400],
          }}
          onClick={handleClickCard}
        >
          <Box sx={{ color: grey[600], fontSize: "36px" }}>NO IMAGE</Box>
        </Box>
      )}
      <Box sx={{ padding: "10px" }}>
        <Box sx={{ marginBottom: "4px", fontSize: "20px" }}>{event.name}</Box>
      </Box>
    </Box>
  );
};
