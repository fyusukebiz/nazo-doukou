import { LoadingSpinner } from "@/components/spinners/LoadingSpinner";
import { useEventLocationEventsQuery } from "@/react_queries/event_location_events/useEventLocationEventsQuery";
import { Box, Container, Grid, Pagination } from "@mui/material";
import { useRouter } from "next/router";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { EventLocationEventCard } from "./misc/EventLocationEventCard";
import { useRouterHistoryContext } from "../../common/RouterHistoryProvider";

export const EventLocationEvents = () => {
  const router = useRouter();
  const [page, setPage] = useState(Number(router.query.page || 1));
  const { data: eventLocationEventData, status: eventLocationEventStatus } =
    useEventLocationEventsQuery({
      query: { page },
    });

  const handleClickPage = (event: ChangeEvent<unknown>, _page: number) => {
    sessionStorage.setItem("eventLoctionEventListPage", _page.toString()); // 次回戻ってきた時用
    setPage(_page); // ページを切り替え
  };

  // ページを切り替える時、スクロールを上までも戻す
  const listBoxRef = useRef<HTMLHRElement>(null);
  const { routerHistory } = useRouterHistoryContext();

  // 初期レンダリング時のスクロール
  useEffect(() => {
    if (eventLocationEventStatus !== "success") return;
    if (/^\/event_location_events\//.test(routerHistory[1])) {
      // イベント詳細から戻ってきた場合、前回のスクロール位置を復元
      const posY = sessionStorage.getItem("eventLocationEventListPosY");
      if (posY) listBoxRef.current?.scroll(0, Number(posY));
    } else {
      // その他の場合、トップにスクロール
      listBoxRef.current?.scroll(0, 0);
    }
    sessionStorage.removeItem("eventLocationEventListPosY");
  }, [routerHistory, eventLocationEventStatus]);

  const saveScrollPosition = useCallback(() => {
    const posY = listBoxRef.current?.scrollTop;
    if (posY) {
      sessionStorage.setItem("eventLocationEventListPosY", String(posY));
    }
  }, []);

  return (
    <Box ref={listBoxRef} sx={{ height: "100%", overflowY: "scroll" }}>
      <Container sx={{ padding: "16px" }} maxWidth="xl">
        {eventLocationEventStatus === "pending" && <LoadingSpinner />}
        {eventLocationEventStatus === "success" && (
          <>
            <Box sx={{ marginBottom: "10px" }}>
              全{eventLocationEventData.totalCount}中
              {eventLocationEventData.currentPage}ページ目
            </Box>
            <Grid container spacing={2}>
              {eventLocationEventData.eventLocationEvents.map((ele, index) => (
                <Grid key={index} item xs={12} sm={6} md={4}>
                  <EventLocationEventCard
                    eventLocationEvent={ele}
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
                count={eventLocationEventData.totalPages}
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
