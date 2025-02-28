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

export const MobileRecruitCard = (props: Props) => {
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
      return recruit.eventLocation!.location.name;
    }
  }, [recruit]);

  return (
    <Box
      sx={{ display: "flex", fontSize: "14px", cursor: "contain" }}
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
        {recruit.eventLocation ? (
          <img
            src={recruit.eventLocation.event.coverImageFileUrl}
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
          label={location}
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
        <Box>
          {recruit.manualEventName
            ? recruit.manualEventName
            : recruit.eventLocation!.event.name}
        </Box>

        <Box>
          {recruit.possibleDates
            .map((date) =>
              formatDateTimeFlex({
                rawDate: date.date,
                hideFromThisYear: true,
                hideTime: true,
              })
            )
            .join(", ")}
        </Box>

        <Box sx={{ display: "flex", alignItems: "end" }}>
          {recruit.numberOfPeople && (
            <Box>募集: {recruit.numberOfPeople}人</Box>
          )}

          <Box
            sx={{ marginLeft: "auto", color: grey[500], fontSize: "12px" }}
            className="test"
          >
            {formatDateTimeFlex({
              rawDate: recruit.createdAt,
              hideFromThisYear: true,
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
