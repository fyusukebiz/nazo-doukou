import { SubPageHeader } from "@/components/layouts/SubPageHeader";
import { LoadingSpinner } from "@/components/spinners/LoadingSpinner";
import { useIsMobileContext } from "@/features/common/IsMobileProvider";
import { useEventLocationQuery } from "@/react_queries/event_locations/useEventLocationQuery";
import { Box, Container } from "@mui/material";
import { blue, grey } from "@mui/material/colors";
import { format } from "date-fns";
import { useRouter } from "next/router";
import { ReactNode, useMemo } from "react";
import { Yusei_Magic } from "next/font/google";

const yuseiMagic = Yusei_Magic({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
});

export const EventLocation = () => {
  const router = useRouter();
  const eventLocationId = router.query.id as string;

  const { data: eleData, status: eventLocationStatus } = useEventLocationQuery({
    path: { eventLocationId },
  });

  const location = useMemo(() => {
    if (!eleData) return;
    const el = eleData.eventLocation;
    return el.building
      ? `${el.location.prefecture.name} / ${el.location.name} / ${el.building}`
      : `${el.location.prefecture.name} / ${el.location.name}`;
  }, [eleData]);

  return (
    <Box sx={{ height: "100%", overflowY: "scroll" }}>
      <SubPageHeader title="イベント詳細" />
      {eventLocationStatus === "pending" && <LoadingSpinner />}
      {eventLocationStatus === "success" && (
        <Container maxWidth="sm" sx={{ padding: "24px" }}>
          <Box sx={{ marginBottom: "15px" }}>
            {eleData.eventLocation.event.coverImageFileUrl ? (
              <img
                src={eleData.eventLocation.event.coverImageFileUrl}
                style={{
                  objectFit: "cover",
                  maxHeight: "220px",
                  width: "100%",
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
                  cursor: "pointer",
                  borderRadius: "10px",
                  backgroundColor: grey[400],
                }}
              >
                <Box sx={{ color: grey[600], fontSize: "36px" }}>NO IMAGE</Box>
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
            <Box sx={{ fontSize: "20px" }}>
              {eleData.eventLocation.event.name}
            </Box>

            <Box sx={{ display: "flex" }}>
              <a
                href={eleData.eventLocation.event.sourceUrl}
                style={{ marginLeft: "auto" }}
              >
                公式
              </a>
            </Box>

            {eleData.eventLocation.event.gameTypes.length > 0 && (
              <Row
                item="種類"
                content={eleData.eventLocation.event.gameTypes
                  .map((type) => type.name)
                  .join(", ")}
              />
            )}

            {eleData.eventLocation.event.twitterTag && (
              <Row
                item="Xタグ"
                content={
                  <a
                    href={
                      "https://twitter.com/hashtag/" +
                      encodeURIComponent(eleData.eventLocation.event.twitterTag)
                    }
                    target="_blank"
                  >
                    {eleData.eventLocation.event.twitterTag}
                  </a>
                }
              />
            )}

            {eleData.eventLocation.event.organization && (
              <Row
                item="主催団体"
                content={eleData.eventLocation.event.organization.name}
              />
            )}

            {eleData.eventLocation.event.numberOfPeopleInTeam && (
              <Row
                item="チーム人数"
                content={eleData.eventLocation.event.numberOfPeopleInTeam}
              />
            )}

            {eleData.eventLocation.event.timeRequired && (
              <Row
                item="所要時間"
                content={eleData.eventLocation.event.timeRequired}
              />
            )}

            {location && <Row item="場所" content={location} />}

            {(eleData.eventLocation.startedAt ||
              eleData.eventLocation.endedAt) && (
              <Row
                item="開催期間"
                content={
                  <Box>
                    {eleData.eventLocation.startedAt
                      ? format(
                          new Date(eleData.eventLocation.startedAt),
                          "MM/d"
                        )
                      : ""}
                    {" ~ "}
                    {eleData.eventLocation.endedAt
                      ? format(new Date(eleData.eventLocation.endedAt), "MM/d")
                      : ""}
                  </Box>
                }
              />
            )}

            {eleData.eventLocation.detailedSchedule && (
              <Row
                item="スケジュール"
                content={eleData.eventLocation.detailedSchedule}
              />
            )}

            {eleData.eventLocation.description && (
              <Row item="詳細" content={eleData.eventLocation.description} />
            )}
          </Box>
        </Container>
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
            backgroundColor: blue[100],
            height: "30px",
            borderRadius: "4px",
            flexShrink: 0,
          }}
          className={yuseiMagic.className}
        >
          <Box sx={{ color: blue[700], fontSize: "14px" }}>{item}</Box>
        </Box>
      </Box>
      <Box sx={{ flexGrow: 1, lineHeight: "30px" }} className="word-wrap">
        {content}
      </Box>
    </Box>
  );
};
