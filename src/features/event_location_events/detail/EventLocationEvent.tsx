import { LoadingSpinner } from "@/components/spinners/LoadingSpinner";
import { useIsMobileContext } from "@/features/common/IsMobileProvider";
import { useEventLocationEventQuery } from "@/react_queries/event_location_events/useEventLocationEventQuery";
import { Box, Container } from "@mui/material";
import { grey } from "@mui/material/colors";
import { format } from "date-fns";
import { useRouter } from "next/router";
import { ReactNode, useMemo } from "react";

export const EventLocationEvent = () => {
  const router = useRouter();
  const eventLocationEventId = router.query.id as string;

  const { data: eleData, status: eventLocationEventStatus } =
    useEventLocationEventQuery({
      path: { eventLocationEventId },
    });

  const location = useMemo(() => {
    if (!eleData) return;
    const ele = eleData.eventLocationEvent;
    return ele.building
      ? `${ele.eventLocation.prefecture.name} / ${ele.eventLocation.name} / ${ele.building}`
      : `${ele.eventLocation.prefecture.name} / ${ele.eventLocation.name}`;
  }, [eleData]);

  return (
    <Box sx={{ height: "100%" }}>
      {eventLocationEventStatus === "pending" && <LoadingSpinner />}
      {eventLocationEventStatus === "success" && (
        <Box sx={{ height: "100%", overflowY: "scroll" }}>
          <Container maxWidth="sm" sx={{ padding: "24px" }}>
            <Box>
              {eleData.eventLocationEvent.event.coverImageFileUrl ? (
                <img
                  src={eleData.eventLocationEvent.event.coverImageFileUrl}
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
              <Box sx={{ fontSize: "20px", marginTop: "10px" }}>
                {eleData.eventLocationEvent.event.name}
              </Box>

              {eleData.eventLocationEvent.event.sourceUrl && (
                <Row
                  item="公式ページ"
                  content={
                    <a href={eleData.eventLocationEvent.event.sourceUrl}>
                      リンク
                    </a>
                  }
                />
              )}

              {eleData.eventLocationEvent.event.gameTypes.length > 0 && (
                <Row
                  item="ゲームタイプ"
                  content={eleData.eventLocationEvent.event.gameTypes
                    .map((type) => type.name)
                    .join(", ")}
                />
              )}

              {eleData.eventLocationEvent.event.twitterTag && (
                <Row
                  item="Xタグ"
                  content={
                    <a
                      href={`https://twitter.com/intent/tweet?hashtags=${eleData.eventLocationEvent.event.twitterTag}`}
                      target="_blank"
                    >
                      {eleData.eventLocationEvent.event.twitterTag}
                    </a>
                  }
                />
              )}

              {eleData.eventLocationEvent.event.organization && (
                <Row
                  item="主催団体"
                  content={eleData.eventLocationEvent.event.organization.name}
                />
              )}

              {eleData.eventLocationEvent.event.numberOfPeopleInTeam && (
                <Row
                  item="チーム人数"
                  content={
                    eleData.eventLocationEvent.event.numberOfPeopleInTeam
                  }
                />
              )}

              {eleData.eventLocationEvent.event.timeRequired && (
                <Row
                  item="所要時間"
                  content={eleData.eventLocationEvent.event.timeRequired}
                />
              )}

              {location && <Row item="場所" content={location} />}

              {(eleData.eventLocationEvent.startedAt ||
                eleData.eventLocationEvent.endedAt) && (
                <Row
                  item="開催期間"
                  content={
                    <Box>
                      {eleData.eventLocationEvent.startedAt
                        ? format(
                            new Date(eleData.eventLocationEvent.startedAt),
                            "MM/dd"
                          )
                        : ""}
                      {" ~ "}
                      {eleData.eventLocationEvent.endedAt
                        ? format(
                            new Date(eleData.eventLocationEvent.endedAt),
                            "MM/dd"
                          )
                        : ""}
                    </Box>
                  }
                />
              )}

              {eleData.eventLocationEvent.detailedSchedule && (
                <Row
                  item="スケジュール"
                  content={eleData.eventLocationEvent.detailedSchedule}
                />
              )}

              {eleData.eventLocationEvent.description && (
                <Row
                  item="詳細"
                  content={eleData.eventLocationEvent.description}
                />
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
