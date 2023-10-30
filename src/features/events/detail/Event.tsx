import { LoadingSpinner } from "@/components/spinners/LoadingSpinner";
import { useEventQuery } from "@/react_queries/events/useEventQuery";
import { Box, Container } from "@mui/material";
import { grey } from "@mui/material/colors";
import { format } from "date-fns";
import { useRouter } from "next/router";
import { useMemo } from "react";

export const Event = () => {
  const router = useRouter();
  const eventId = router.query.id as string;
  const { data: eventData, status: eventStatus } = useEventQuery({
    path: { eventId },
  });

  const location = useMemo(() => {
    if (!eventData) return;
    const loc = eventData.event.prefectures
      .map((pref) => pref.eventLocations)
      .flat()[0];
    return loc;
  }, [eventData]);

  return (
    <Box sx={{ height: "100%" }}>
      {/* <Box sx={{ flexGrow: 1, minHeight: 0 }}> */}
      {eventStatus === "pending" && <LoadingSpinner />}
      {eventStatus === "success" && (
        <Box sx={{ height: "100%", overflowY: "scroll" }}>
          <Container maxWidth="sm" sx={{ padding: "24px" }}>
            <Box>
              {eventData.event.coverImageFileUrl ? (
                <img
                  src={eventData.event.coverImageFileUrl}
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
              <Box sx={{ fontSize: "20px" }}>{eventData.event.name}</Box>

              {/* <Divider sx={{ borderBottom: `1px solid ${grey[300]}` }} /> */}

              {eventData.event.sourceUrl && (
                <Box sx={{ display: "flex", alignItems: "start" }}>
                  <Box sx={{ width: "100px", flexShrink: 0 }}>公式ページ</Box>
                  <Box sx={{ flexGrow: 1 }} className="word-wrap">
                    <a href={eventData.event.sourceUrl}>リンク</a>
                  </Box>
                </Box>
              )}

              {eventData.event.organization && (
                <Box sx={{ display: "flex", alignItems: "start" }}>
                  <Box sx={{ width: "100px", flexShrink: 0 }}>主催団体</Box>
                  <Box sx={{ flexGrow: 1 }} className="word-wrap">
                    {eventData.event.organization.name}
                  </Box>
                </Box>
              )}

              {eventData.event.numberOfPeopleInTeam && (
                <Box sx={{ display: "flex", alignItems: "start" }}>
                  <Box sx={{ width: "100px", flexShrink: 0 }}>チーム人数</Box>
                  <Box sx={{ flexGrow: 1 }} className="word-wrap">
                    {eventData.event.numberOfPeopleInTeam}
                  </Box>
                </Box>
              )}

              {eventData.event.timeRequired && (
                <Box sx={{ display: "flex", alignItems: "start" }}>
                  <Box sx={{ width: "100px", flexShrink: 0 }}>所要時間</Box>
                  <Box sx={{ flexGrow: 1 }} className="word-wrap">
                    {eventData.event.timeRequired}
                  </Box>
                </Box>
              )}

              {/* <Box sx={{ display: "flex", alignItems: "start" }}>
                <Box
                  sx={{
                    width: "100px",
                    flexShrink: 0,
                    display: "flex",
                  }}
                >
                  <Box sx={{ marginBottom: "auto" }}>場所・日付</Box>
                </Box>
                <Box sx={{ flexGrow: 1 }} className="word-wrap">
                  {eventData.event.prefectures
                    .map((pref) => pref.eventLocations)
                    .flat()
                    .map((loc, index) => (
                      <Box key={index}>
                        <Box>
                          {loc.building
                            ? loc.name + "(" + loc.building + ")"
                            : loc.name}
                        </Box>
                        {loc.dates.length > 0 && (
                          <Box>
                            {loc.dates
                              .map((date) =>
                                format(new Date(date.date), "MM/dd")
                              )
                              .join(", ")}
                          </Box>
                        )}
                        {loc.description && <Box>{loc.description}</Box>}
                      </Box>
                    ))}
                </Box>
              </Box> */}

              {location && (
                <Box sx={{ display: "flex", alignItems: "start" }}>
                  <Box
                    sx={{
                      width: "100px",
                      flexShrink: 0,
                      display: "flex",
                    }}
                  >
                    <Box sx={{ marginBottom: "auto" }}>場所</Box>
                  </Box>
                  <Box sx={{ flexGrow: 1 }} className="word-wrap">
                    <Box>
                      <Box>
                        {location.building
                          ? location.name + "(" + location.building + ")"
                          : location.name}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}

              {location && (location.startedAt || location.endedAt) && (
                <Box sx={{ display: "flex", alignItems: "start" }}>
                  <Box
                    sx={{
                      width: "100px",
                      flexShrink: 0,
                      display: "flex",
                    }}
                  >
                    <Box sx={{ marginBottom: "auto" }}>時間</Box>
                  </Box>
                  <Box sx={{ flexGrow: 1 }} className="word-wrap">
                    <Box>
                      <Box>
                        {location.startedAt
                          ? format(new Date(location.startedAt), "MM/dd")
                          : ""}
                        {" ~ "}
                        {location.endedAt
                          ? format(new Date(location.endedAt), "MM/dd")
                          : ""}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}

              {eventData.event.description && (
                <Box sx={{ display: "flex", alignItems: "start" }}>
                  <Box sx={{ width: "100px", flexShrink: 0 }}>詳細</Box>
                  <Box sx={{ flexGrow: 1 }} className="word-wrap">
                    {eventData.event.description}
                  </Box>
                </Box>
              )}
            </Box>
          </Container>
        </Box>
      )}
      {/* </Box> */}
    </Box>
  );
};
