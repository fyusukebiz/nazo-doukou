import { LoadingSpinner } from "@/components/spinners/LoadingSpinner";
import {
  EventSearchQueryParams,
  useEventsQuery,
} from "@/react_queries/events/useEventsQuery";
import { Box, Container, Grid, Pagination } from "@mui/material";
import { useRouter } from "next/router";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { EventCard } from "./misc/EventCard";
import { useRouterHistoryContext } from "../../common/RouterHistoryProvider";

export const Events = () => {
  const router = useRouter();
  const [page, setPage] = useState(Number(router.query.page || 1));
  const [queryParams, setQueryParams] = useState<EventSearchQueryParams>();
  const [isInitialized, setIsInitialized] = useState(false);
  const { data: eventsData, status: eventsStatus } = useEventsQuery(
    {
      query: { page },
    },
    isInitialized
  );

  const handleClickPage = (event: ChangeEvent<unknown>, _page: number) => {
    sessionStorage.setItem("eventListPage", _page.toString()); // 次回戻ってきた時用
    setPage(_page); // ページを切り替え
  };

  // 前回の検索結果を復元
  useEffect(() => {
    const rawParams = sessionStorage.getItem("eventListParams");
    if (!!rawParams && typeof JSON.parse(rawParams) === "object") {
      setQueryParams(JSON.parse(rawParams));
    }
    const rawPage = sessionStorage.getItem("eventListPage");
    const page = !Number.isNaN(Number(rawPage)) ? Number(rawPage) : undefined;
    if (page) setPage(page);
    setIsInitialized(true);
  }, [setQueryParams]);

  // ページを切り替える時、スクロールを上までも戻す
  const listBoxRef = useRef<HTMLHRElement>(null);
  const { routerHistory } = useRouterHistoryContext();

  // 初期レンダリング時のスクロール
  useEffect(() => {
    if (eventsStatus !== "success") return;
    if (/^\/events\//.test(routerHistory[1])) {
      // イベント詳細から戻ってきた場合、前回のスクロール位置を復元
      const posY = sessionStorage.getItem("eventListPosY");
      if (posY) listBoxRef.current?.scroll(0, Number(posY));
    } else {
      // その他の場合、トップにスクロール
      listBoxRef.current?.scroll(0, 0);
    }
    sessionStorage.removeItem("eventListPosY");
  }, [routerHistory, eventsStatus]);

  const saveScrollPosition = useCallback(() => {
    const posY = listBoxRef.current?.scrollTop;
    if (posY) sessionStorage.setItem("eventListPosY", String(posY));
  }, []);

  return (
    <Box ref={listBoxRef} sx={{ height: "100%", overflowY: "scroll" }}>
      <Container sx={{ padding: "16px" }} maxWidth="xl">
        {eventsStatus === "pending" && <LoadingSpinner />}
        {eventsStatus === "success" && (
          <>
            <Box sx={{ marginBottom: "10px" }}>
              全{eventsData.totalCount}中{eventsData.currentPage}ページ目
            </Box>
            <Grid container spacing={2}>
              {eventsData.events.map((event, index) => (
                <Grid key={index} item xs={12} sm={6} md={4}>
                  <EventCard
                    event={event}
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
                count={eventsData.totalPages}
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
