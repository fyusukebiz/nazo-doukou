import { LoadingSpinner } from "@/components/spinners/LoadingSpinner";
import { useEventLocationsQuery } from "@/react_queries/event_locations/useEventLocationsQuery";
import { Box, Container, Grid, Pagination } from "@mui/material";
import { useRouter } from "next/router";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { EventLocationCard } from "./misc/EventLocationCard";
import { useRouterHistoryContext } from "../../common/RouterHistoryProvider";
import { blue, grey, teal } from "@mui/material/colors";

export const EventLocations = () => {
  const router = useRouter();
  const [page, setPage] = useState(Number(router.query.page || 1));
  const { data: eventLocationsData, status: eventLocationsStatus } =
    useEventLocationsQuery({
      query: { page },
    });

  const handleClickPage = (event: ChangeEvent<unknown>, _page: number) => {
    setPage(_page); // ページを切り替え
  };

  // ページを切り替える時、スクロールを上までも戻す
  const listBoxRef = useRef<HTMLHRElement>(null);
  const { routerHistory } = useRouterHistoryContext();

  // 初期レンダリング時のスクロール
  useEffect(() => {
    if (eventLocationsStatus !== "success") return;
    if (/^\/event_locations\//.test(routerHistory[1])) {
      // イベント詳細から戻ってきた場合、前回のスクロール位置を復元
      const posY = sessionStorage.getItem("eventLocationListPosY");
      if (posY) listBoxRef.current?.scroll(0, Number(posY));
    } else {
      // その他の場合、トップにスクロール
      listBoxRef.current?.scroll(0, 0);
    }
    sessionStorage.removeItem("eventLocationListPosY");
  }, [routerHistory, eventLocationsStatus]);

  const saveScrollPosition = useCallback(() => {
    const posY = listBoxRef.current?.scrollTop;
    if (posY) {
      sessionStorage.setItem("eventLocationListPosY", String(posY));
    }
  }, []);

  return (
    <Box ref={listBoxRef} sx={{ height: "100%", overflowY: "scroll" }}>
      <Container sx={{ padding: "16px" }} maxWidth="xl">
        {eventLocationsStatus === "pending" && <LoadingSpinner />}
        {eventLocationsStatus === "success" && (
          <>
            <Box
              sx={{
                display: "flex",
                marginBottom: "15px",
                textAlign: "center",
                fontSize: "20px",
              }}
            >
              <Box
                sx={{
                  width: "50%",
                  backgroundColor: grey[100],
                  borderRadius: "5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "40px",
                  cursor: "pointer",
                }}
                onClick={() => router.push("/recruits")}
              >
                <Box>募集</Box>
              </Box>
              <Box
                sx={{
                  width: "50%",
                  color: blue[500],
                  backgroundColor: blue[100],
                  borderRadius: "5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "40px",
                }}
              >
                <Box>イベント</Box>
              </Box>
            </Box>
            <Box sx={{ marginBottom: "10px" }}>
              全{eventLocationsData.totalCount}中
              {eventLocationsData.currentPage}ページ目
            </Box>
            <Grid container spacing={2}>
              {eventLocationsData.eventLocations.map((eventLocation, index) => (
                <Grid key={index} item xs={12} sm={6} md={4}>
                  <EventLocationCard
                    eventLocation={eventLocation}
                    saveScrollPosition={saveScrollPosition}
                  />
                </Grid>
              ))}
            </Grid>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                my: 2,
                paddingBottom: "80px",
              }}
            >
              <Pagination
                count={eventLocationsData.totalPages}
                page={page}
                boundaryCount={0}
                siblingCount={2}
                color="primary"
                shape="rounded"
                size="large"
                onChange={handleClickPage}
              />
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
};
