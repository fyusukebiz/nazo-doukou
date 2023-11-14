import { LoadingSpinner } from "@/components/spinners/LoadingSpinner";
import { useEventsQueryByAdmin } from "@/react_queries/admin/events/useEventsQueryByAdmin";
import { Box, Button, Container, Grid, Pagination } from "@mui/material";
import { useRouter } from "next/router";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { EventCard } from "./misc/EventCard";
import { useRouterHistoryContext } from "@/features/common/RouterHistoryProvider";
import Link from "next/link";
import { blue, grey } from "@mui/material/colors";

export const Events = () => {
  const router = useRouter();
  const [page, setPage] = useState(Number(router.query.page || 1));
  const { data: eventsData, status: eventsStatus } = useEventsQueryByAdmin({
    query: { page },
  });

  const handleClickPage = (event: ChangeEvent<unknown>, _page: number) => {
    sessionStorage.setItem("eventListPage", _page.toString()); // 次回戻ってきた時用
    setPage(_page); // ページを切り替え
  };

  // ページを切り替える時、スクロールを上までも戻す
  const listBoxRef = useRef<HTMLHRElement>(null);
  const { routerHistory } = useRouterHistoryContext();

  // 初期レンダリング時のスクロール
  useEffect(() => {
    if (eventsStatus !== "success") return;
    if (/^\/admin\/events\//.test(routerHistory[1])) {
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
    if (posY) {
      sessionStorage.setItem("eventListPosY", String(posY));
    }
  }, []);

  return (
    <Box ref={listBoxRef} sx={{ height: "100%", overflowY: "scroll" }}>
      <Container sx={{ padding: "16px" }} maxWidth="xl">
        {eventsStatus === "pending" && <LoadingSpinner />}
        {eventsStatus === "success" && (
          <>
            <Box
              sx={{
                display: "flex",
                marginBottom: "15px",
                textAlign: "center",
                fontSize: "18px",
              }}
            >
              <Box
                sx={{
                  width: "50%",
                  backgroundColor: grey[100],
                  color: grey[500],
                  borderRadius: "5px 0px 0px 5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "40px",
                  cursor: "pointer",
                }}
                onClick={() => router.push("/admin/recruits")}
              >
                同行者募集(by管理)
              </Box>
              <Box
                sx={{
                  width: "50%",
                  color: blue[500],
                  backgroundColor: blue[100],
                  borderRadius: "0px 5px 5px 0px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "40px",
                }}
              >
                イベント
              </Box>
            </Box>

            <Box sx={{ display: "flex" }}>
              <Link
                href="/admin/events/new"
                style={{ textDecoration: "none", marginLeft: "auto" }}
                passHref
              >
                <Button variant="outlined" size="large">
                  新規作成
                </Button>
              </Link>
            </Box>
            <Box sx={{ marginBottom: "10px" }}>
              全{eventsData.totalCount}個中{eventsData.currentPage}ページ目
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
