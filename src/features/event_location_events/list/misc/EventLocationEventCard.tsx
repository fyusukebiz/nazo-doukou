import { Box, Chip } from "@mui/material";
import { grey, lightBlue } from "@mui/material/colors";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { format } from "date-fns";
import { EventLocationEventSimple } from "@/types/eventLocationEvent";

type Props = {
  eventLocationEvent: EventLocationEventSimple;
  saveScrollPosition?: () => void;
};

// TODO 詳細と一覧でコンポーネントを分けた方が良い
export const EventLocationEventCard = (props: Props) => {
  const { eventLocationEvent: ele, saveScrollPosition } = props;
  const router = useRouter();

  const handleClickCard = () => {
    if (!saveScrollPosition) return;
    saveScrollPosition();
    router.push(`/event_location_events/${ele.id}`);
  };

  const period = useMemo(() => {
    if (!ele.startedAt && !ele.endedAt) return "";
    return `${
      ele.startedAt ? format(new Date(ele.startedAt), "MM/dd") : ""
    } ~ ${ele.endedAt ? format(new Date(ele.endedAt), "MM/dd") : ""}`;
  }, [ele]);

  return (
    <Box sx={{ border: `1px solid ${grey[300]}`, borderRadius: "10px" }}>
      {ele.event.coverImageFileUrl ? (
        <img
          src={ele.event.coverImageFileUrl}
          style={{
            objectFit: "cover",
            maxHeight: "220px",
            width: "100%",
            marginBottom: "8px",
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
        <Box sx={{ marginBottom: "4px", fontSize: "20px" }}>
          {ele.event.name}
        </Box>
        <Box
          sx={{ display: "flex", alignItems: "center", marginBottom: "4px" }}
        >
          {/* 期間 */}
          <Box>{period}</Box>
          {/* 場所 */}
          <Chip
            label={`${ele.eventLocation.prefecture.name} / ${ele.eventLocation.name}`}
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
