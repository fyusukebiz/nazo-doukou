import { Box, Chip } from "@mui/material";
import { grey, lightBlue } from "@mui/material/colors";
import { useRouter } from "next/router";
import { format } from "date-fns";
import { EventLocationSimple } from "@/types/eventLocation";
import { useMemo } from "react";

type Props = {
  eventLocation: EventLocationSimple;
  saveScrollPosition?: () => void;
};

export const MobileEventLocationCard = (props: Props) => {
  const { eventLocation, saveScrollPosition } = props;
  const router = useRouter();

  const handleClickCard = () => {
    if (!saveScrollPosition) return;
    saveScrollPosition();
    router.push(`/event_locations/${eventLocation.id}`);
  };

  const period = useMemo(() => {
    if (!eventLocation.startedAt && !eventLocation.endedAt) return undefined;
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
    <Box
      sx={{ display: "flex", fontSize: "14px", cursor: "pointer" }}
      onClick={handleClickCard}
    >
      <Box
        sx={{
          width: "170px",
          maxWidth: "220px",
          height: "100px",
          flexShrink: 0,
          position: "relative",
        }}
      >
        {eventLocation.event.coverImageFileUrl ? (
          <img
            src={eventLocation.event.coverImageFileUrl}
            style={{
              height: "100%",
              width: "100%",
              objectFit: "cover",
              borderRadius: "10px",
            }}
            alt="image"
            loading="lazy"
          />
        ) : (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "10px",
              backgroundColor: grey[400],
            }}
          >
            <Box sx={{ color: grey[600], fontSize: "20px" }}>NO IMAGE</Box>
          </Box>
        )}
        <Chip
          label={eventLocation.location.name}
          sx={{
            position: "absolute",
            bottom: "5px",
            right: "5px",
            background: lightBlue[200],
            color: lightBlue[900],
          }}
          size="small"
        />
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          marginLeft: "10px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box>{eventLocation.event.name}</Box>

        {eventLocation.event.timeRequired && (
          <Box>{eventLocation.event.timeRequired}</Box>
        )}

        {period && <Box>{period}</Box>}
      </Box>
    </Box>
  );
};
