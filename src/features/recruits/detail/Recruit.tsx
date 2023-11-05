import { LoadingSpinner } from "@/components/spinners/LoadingSpinner";
import { useIsMobileContext } from "@/features/common/IsMobileProvider";
import { useRecruitQuery } from "@/react_queries/recruits/useRecruitQuery";
import { Box, Chip, Container } from "@mui/material";
import { grey } from "@mui/material/colors";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useMemo } from "react";

export const Recruit = () => {
  const router = useRouter();
  const recruitId = router.query.id as string;

  const { data: recruitData, status: recruitStatus } = useRecruitQuery({
    path: { recruitId },
  });

  const location = useMemo(() => {
    if (recruitStatus !== "success") return "";
    if (recruitData.recruit.manualEventLocation) {
      return recruitData.recruit.manualEventLocation;
    } else {
      return (
        recruitData.recruit.eventLocationEvent!.eventLocation.name +
        (recruitData.recruit.eventLocationEvent!.building
          ? " / " + recruitData.recruit.eventLocationEvent!.building
          : "")
      );
    }
  }, [recruitData, recruitStatus]);

  return (
    <Box sx={{ height: "100%" }}>
      {recruitStatus === "pending" && <LoadingSpinner />}
      {recruitStatus === "success" && (
        <Box sx={{ height: "100%", overflowY: "scroll" }}>
          <Container maxWidth="sm" sx={{ padding: "24px" }}>
            <Box>
              {recruitData.recruit.eventLocationEvent ? (
                <img
                  src={
                    recruitData.recruit.eventLocationEvent.event
                      .coverImageFileUrl
                  }
                  style={{
                    objectFit: "cover",
                    maxHeight: "220px",
                    width: "100%",
                    marginBottom: "8px",
                    cursor: "pointer",
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
                    marginBottom: "8px",
                    cursor: "pointer",
                    borderRadius: "10px",
                    backgroundColor: grey[400],
                  }}
                >
                  <Box sx={{ color: grey[600], fontSize: "36px" }}>
                    NO IMAGE
                  </Box>
                </Box>
              )}
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
                marginTop: "10px",
              }}
            >
              {/* イベント名 */}
              <Box sx={{ fontSize: "20px" }}>
                {recruitData.recruit.manualEventName
                  ? recruitData.recruit.manualEventName
                  : recruitData.recruit.eventLocationEvent!.event.name}
              </Box>

              {recruitData.recruit.eventLocationEvent?.id && (
                <Row
                  item="イベント"
                  content={
                    <Link
                      href={`/event_location_events/${recruitData.recruit.eventLocationEvent.id}`}
                    >
                      リンク
                    </Link>
                  }
                />
              )}

              {location && <Row item="場所" content={location} />}

              <Row
                item="候補日"
                content={recruitData.recruit.possibleDates
                  .map((date) => format(new Date(date.date), "MM/dd"))
                  .join(", ")}
              />

              {recruitData.recruit.user && (
                <Row item="募集者" content={recruitData.recruit.user.name} />
              )}

              {recruitData.recruit.user?.twitter && (
                <Row
                  item="Xアカウント"
                  content={recruitData.recruit.user.twitter}
                />
              )}

              {recruitData.recruit.numberOfPeople && (
                <Row
                  item="募集人数"
                  content={recruitData.recruit.numberOfPeople}
                />
              )}

              {recruitData.recruit.recruitTags.length > 0 && (
                <Row
                  item="タグ"
                  content={
                    <Box sx={{ display: "flex", gap: "5px" }}>
                      {recruitData.recruit.recruitTags.map((tag, index) => (
                        <Chip key={index} label="Small" size="small" />
                      ))}
                    </Box>
                  }
                />
              )}

              {recruitData.recruit.description && (
                <Row item="詳細" content={recruitData.recruit.description} />
              )}
            </Box>
          </Container>
        </Box>
      )}
    </Box>
  );
};

const Row = ({ item, content }: { item: string; content: ReactNode }) => {
  const { isMobile } = useIsMobileContext();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "start",
        gap: isMobile ? "0px" : "20px",
      }}
    >
      <Box sx={{ width: "100px", flexShrink: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "90px",
            backgroundColor: grey[200],
            height: "25px",
            borderRadius: "4px",
            flexShrink: 0,
          }}
        >
          <Box sx={{ color: grey[600], fontSize: "14px" }}>{item}</Box>
        </Box>
      </Box>
      <Box sx={{ flexGrow: 1, lineHeight: "25px" }} className="word-wrap">
        {content}
      </Box>
    </Box>
  );
};
