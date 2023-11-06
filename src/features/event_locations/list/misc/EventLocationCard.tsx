import { Box, Chip } from "@mui/material";
import { grey, lightBlue } from "@mui/material/colors";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { format } from "date-fns";
import { EventLocationSimple } from "@/types/eventLocation";

type Props = {
  eventLocation: EventLocationSimple;
  saveScrollPosition?: () => void;
};

export const EventLocationCard = (props: Props) => {
  const { eventLocation, saveScrollPosition } = props;
  const router = useRouter();

  const handleClickCard = () => {
    if (!saveScrollPosition) return;
    saveScrollPosition();
    router.push(`/event_locations/${eventLocation.id}`);
  };

  const period = useMemo(() => {
    if (!eventLocation.startedAt && !eventLocation.endedAt) return "";
    return `${
      eventLocation.startedAt
        ? format(new Date(eventLocation.startedAt), "MM/d")
        : ""
    } ~ ${
      eventLocation.endedAt
        ? format(new Date(eventLocation.endedAt), "MM/d")
        : ""
    }`;
  }, [eventLocation]);

  return (
    <Box sx={{ border: `1px solid ${grey[300]}`, borderRadius: "10px" }}>
      {eventLocation.event.coverImageFileUrl ? (
        <img
          src={eventLocation.event.coverImageFileUrl}
          style={{
            objectFit: "cover",
            maxHeight: "220px",
            width: "100%",
            cursor: "pointer",
            borderRadius: "10px",
          }}
          onClick={handleClickCard}
          alt="image"
        />
      ) : (
        <Box
          sx={{
            height: "220px",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
        <Box sx={{ marginBottom: "10px", fontSize: "20px" }}>
          {eventLocation.event.name}
        </Box>
        <Box
          sx={{ display: "flex", alignItems: "center", marginBottom: "4px" }}
        >
          {/* 期間 */}
          <Box>{period}</Box>
          {/* 場所 */}
          <Chip
            label={`${eventLocation.location.prefecture.name} / ${eventLocation.location.name}`}
            sx={{
              background: lightBlue[200],
              color: lightBlue[900],
              marginLeft: "auto",
            }}
            size="small"
          />
        </Box>
      </Box>
    </Box>
  );
};
