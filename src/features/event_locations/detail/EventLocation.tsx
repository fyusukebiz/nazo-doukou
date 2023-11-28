import { SubPageHeader } from "@/components/layouts/SubPageHeader";
import { LoadingSpinner } from "@/components/spinners/LoadingSpinner";
import { useIsMobileContext } from "@/features/common/IsMobileProvider";
import { useEventLocationQuery } from "@/react_queries/event_locations/useEventLocationQuery";
import { Box, Container } from "@mui/material";
import { blue, grey, teal } from "@mui/material/colors";
import { format } from "date-fns";
import { useRouter } from "next/router";
import { ReactNode, useMemo } from "react";
import { Yusei_Magic } from "next/font/google";
import { insertLinkInText } from "@/utils/insertLinkInText";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import allLocales from "@fullcalendar/core/locales-all";
import { formatDateTimeFlex } from "@/utils/formatDateTimeFlex";

const yuseiMagic = Yusei_Magic({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
});

export const EventLocation = () => {
  const router = useRouter();
  const eventLocationId = router.query.id as string;

  const { data: elData, status: eventLocationStatus } = useEventLocationQuery({
    path: { eventLocationId },
  });

  const location = useMemo(() => {
    if (!elData) return;
    const el = elData.eventLocation;
    return el.building
      ? `${el.location.prefecture.name} / ${el.location.name} / ${el.building}`
      : `${el.location.prefecture.name} / ${el.location.name}`;
  }, [elData]);

  return (
    <Box sx={{ height: "100%", overflowY: "scroll" }}>
      <SubPageHeader title="イベント詳細" />
      {eventLocationStatus === "pending" && <LoadingSpinner />}
      {eventLocationStatus === "success" && (
        <Container maxWidth="sm" sx={{ padding: "24px" }}>
          <Box sx={{ marginBottom: "15px" }}>
            {elData.eventLocation.event.coverImageFileUrl ? (
              <img
                src={elData.eventLocation.event.coverImageFileUrl}
                style={{
                  objectFit: "cover",
                  maxHeight: "220px",
                  minHeight: "90px",
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
              {elData.eventLocation.event.name}
            </Box>

            {elData.eventLocation.event.sourceUrl && (
              <Box sx={{ display: "flex" }}>
                <a
                  href={elData.eventLocation.event.sourceUrl}
                  style={{ marginLeft: "auto" }}
                >
                  公式
                </a>
              </Box>
            )}

            {elData.eventLocation.event.gameTypes.length > 0 && (
              <Row
                item="種類"
                content={elData.eventLocation.event.gameTypes
                  .map((type) => type.name)
                  .join(", ")}
              />
            )}

            {elData.eventLocation.event.twitterTag && (
              <Row
                item="Xタグ"
                content={
                  <a
                    href={
                      "https://twitter.com/search?q=" +
                      encodeURIComponent(
                        "#" + elData.eventLocation.event.twitterTag
                      )
                    }
                    target="_blank"
                  >
                    {elData.eventLocation.event.twitterTag}
                  </a>
                }
              />
            )}

            {elData.eventLocation.event.organization && (
              <Row
                item="主催団体"
                content={elData.eventLocation.event.organization.name}
              />
            )}

            {elData.eventLocation.event.numberOfPeopleInTeam && (
              <Row
                item="チーム人数"
                content={elData.eventLocation.event.numberOfPeopleInTeam}
              />
            )}

            {elData.eventLocation.event.timeRequired && (
              <Row
                item="所要時間"
                content={elData.eventLocation.event.timeRequired}
              />
            )}

            {location && <Row item="場所" content={location} />}

            {elData.eventLocation.dateType === "RANGE" &&
              (elData.eventLocation.startedAt ||
                elData.eventLocation.endedAt) && (
                <Row
                  item="開催期間"
                  content={
                    <Box>
                      {!elData.eventLocation.startedAt &&
                      !elData.eventLocation.endedAt
                        ? ""
                        : `${
                            elData.eventLocation.startedAt
                              ? formatDateTimeFlex({
                                  rawDate: elData.eventLocation.startedAt,
                                  hideFromThisYear: true,
                                  hideTime: true,
                                })
                              : ""
                          } ~ ${
                            elData.eventLocation.endedAt
                              ? formatDateTimeFlex({
                                  rawDate: elData.eventLocation.endedAt,
                                  hideFromThisYear: true,
                                  hideTime: true,
                                })
                              : ""
                          }`}
                    </Box>
                  }
                />
              )}

            {elData.eventLocation.dateType === "INDIVISUAL" &&
              elData.eventLocation.eventLocationDates.length > 0 && (
                <Box>
                  <Box sx={{ width: "100px", marginBottom: "10px" }}>
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
                      <Box sx={{ color: blue[700], fontSize: "14px" }}>
                        開催日
                      </Box>
                    </Box>
                  </Box>
                  <FullCalendar
                    locales={allLocales}
                    locale="ja"
                    plugins={[dayGridPlugin]}
                    initialView="dayGridMonth"
                    firstDay={1} // 月曜始まり
                    timeZone="Asia/Tokyo"
                    contentHeight="auto"
                    events={[
                      ...elData.eventLocation.eventLocationDates.map((eld) => ({
                        start: format(new Date(eld.date), "yyy-MM-dd"),
                        display: "background",
                        color: teal[500] as string,
                      })),
                      { title: "今日", start: format(new Date(), "yyy-MM-dd") },
                    ]}
                    eventBackgroundColor={blue[200]}
                    eventBorderColor={blue[200]}
                    eventTextColor={blue[700]}
                  />
                </Box>
              )}

            {elData.eventLocation.detailedSchedule && (
              <Row
                item="スケジュール"
                content={elData.eventLocation.detailedSchedule}
              />
            )}

            {elData.eventLocation.description && (
              <Box
                sx={{ whiteSpace: "pre-wrap" }}
                dangerouslySetInnerHTML={{
                  __html: insertLinkInText(elData.eventLocation.description),
                }}
              ></Box>
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
