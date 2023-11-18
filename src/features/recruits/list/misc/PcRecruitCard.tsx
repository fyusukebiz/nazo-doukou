import { Box, Chip } from "@mui/material";
import { grey, lightBlue } from "@mui/material/colors";
import { useRouter } from "next/router";
import { format } from "date-fns";
import { RecruitSimple } from "@/types/recruit";
import { formatDateTimeFlex } from "@/utils/formatDateTimeFlex";
import { useMemo } from "react";

type Props = {
  recruit: RecruitSimple;
  saveScrollPosition?: () => void;
};

export const PcRecruitCard = (props: Props) => {
  const { recruit, saveScrollPosition } = props;
  const router = useRouter();

  const handleClickCard = () => {
    if (!saveScrollPosition) return;
    saveScrollPosition();
    router.push(`/recruits/${recruit.id}`);
  };

  const location = useMemo(() => {
    if (recruit.manualLocation) {
      return recruit.manualLocation;
    } else {
      return (
        recruit.eventLocation!.location.name +
        (recruit.eventLocation!.building
          ? " / " + recruit.eventLocation!.building
          : "")
      );
    }
  }, [recruit]);

  return (
    <Box
      sx={{
        border: `1px solid ${grey[300]}`,
        borderRadius: "10px",
        cursor: "pointer",
      }}
      onClick={handleClickCard}
    >
      {recruit.eventLocation ? (
        <img
          src={recruit.eventLocation.event.coverImageFileUrl}
          style={{
            objectFit: "cover",
            maxHeight: "220px",
            width: "100%",
            borderRadius: "10px",
          }}
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
            borderRadius: "10px",
            backgroundColor: grey[400],
          }}
        >
          <Box sx={{ color: grey[600], fontSize: "36px" }}>NO IMAGE</Box>
        </Box>
      )}
      <Box sx={{ padding: "10px" }}>
        <Box sx={{ marginBottom: "10px", fontSize: "20px" }}>
          {recruit.manualEventName
            ? recruit.manualEventName
            : recruit.eventLocation!.event.name}
        </Box>
        <Box
          sx={{ display: "flex", alignItems: "center", marginBottom: "4px" }}
        >
          {/* 日付 */}
          <Box sx={{ marginRight: "10px" }}>
            {recruit.possibleDates
              .map((date) => format(new Date(date.date), "MM/d"))
              .join(", ")}
          </Box>
          {/* 場所 */}
          <Chip
            label={location}
            sx={{
              background: lightBlue[200],
              color: lightBlue[900],
              marginLeft: "auto",
            }}
            size="small"
          />
        </Box>

        {recruit.numberOfPeople && (
          <Box>募集人数：{recruit.numberOfPeople}</Box>
        )}

        <Box sx={{ display: "flex" }}>
          <Box sx={{ marginLeft: "auto", color: grey[500], fontSize: "12px" }}>
            {formatDateTimeFlex({
              rawDate: recruit.createdAt,
              hideYear: true,
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
