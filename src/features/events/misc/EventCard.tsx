import { Box, Chip } from "@mui/material";
import { grey, lightBlue } from "@mui/material/colors";
import { useRouter } from "next/router";
import { Event } from "@/types/event";
import { useMemo } from "react";
import { format } from "date-fns";

type Props = {
  event: Event;
  saveScrollPosition?: () => void;
};

// TODO 詳細と一覧でコンポーネントを分けた方が良い
export const EventCard = (props: Props) => {
  const { event, saveScrollPosition } = props;
  const router = useRouter();

  const handleClickCard = () => {
    if (!saveScrollPosition) return;
    saveScrollPosition();
    router.push(`/events/${event.id}`);
  };

  const period = useMemo(() => {
    const dateArrayInMsec = event.prefectures
      .map((pref) =>
        pref.eventLocations
          .map((loc) => loc.dates.map((date) => date.date))
          .flat()
      )
      .flat()
      .map((date) => new Date(date).getTime());
    if (dateArrayInMsec.length === 0) {
      return "期間未記載";
    }

    const earliestDate = new Date(Math.min(...dateArrayInMsec));
    const latestDate = new Date(Math.max(...dateArrayInMsec));
    if (earliestDate === latestDate) return format(earliestDate, "MM/dd");

    return `${format(earliestDate, "MM/dd")} ~ ${format(latestDate, "MM/dd")}`;
  }, [event.prefectures]);

  return (
    <Box sx={{ border: `1px solid ${grey[300]}`, borderRadius: "10px" }}>
      {event.coverImageFileUrl ? (
        <img
          src={event.coverImageFileUrl}
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
        <Box sx={{ marginBottom: "4px", fontSize: "20px" }}>{event.name}</Box>
        <Box
          sx={{ display: "flex", alignItems: "center", marginBottom: "4px" }}
        >
          {/* 期間 */}
          <Box>{period}</Box>
          {/* 場所 */}
          {event.prefectures.length > 0 && (
            <Chip
              label={event.prefectures
                .map((p) => p.eventLocations.map((loc) => loc.name))
                .flat()
                .join(" ")}
              sx={{
                background: lightBlue[200],
                color: lightBlue[900],
                marginLeft: "auto",
              }}
              size="small"
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};
