import { LoadingSpinner } from "@/components/spinners/LoadingSpinner";
import { useRecruitsQuery } from "@/react_queries/recruits/useRecruitsQuery";
import { Box, Container, Grid, Pagination } from "@mui/material";
import { useRouter } from "next/router";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { RecruitCard } from "./misc/RecruitCard";
import { useRouterHistoryContext } from "../../common/RouterHistoryProvider";
import { blue, grey, teal } from "@mui/material/colors";

export const Recruits = () => {
  const router = useRouter();
  const [page, setPage] = useState(Number(router.query.page || 1));
  const { data: recruitsData, status: recruitsStatus } = useRecruitsQuery({
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
    if (recruitsStatus !== "success") return;
    if (/^\/recruits\//.test(routerHistory[1])) {
      // イベント詳細から戻ってきた場合、前回のスクロール位置を復元
      const posY = sessionStorage.getItem("recruitListPosY");
      if (posY) listBoxRef.current?.scroll(0, Number(posY));
    } else {
      // その他の場合、トップにスクロール
      listBoxRef.current?.scroll(0, 0);
    }
    sessionStorage.removeItem("recruitListPosY");
  }, [routerHistory, recruitsStatus]);

  const saveScrollPosition = useCallback(() => {
    const posY = listBoxRef.current?.scrollTop;
    if (posY) {
      sessionStorage.setItem("recruitListPosY", String(posY));
    }
  }, []);

  return (
    <Box ref={listBoxRef} sx={{ height: "100%", overflowY: "scroll" }}>
      <Container sx={{ padding: "16px" }} maxWidth="xl">
        {recruitsStatus === "pending" && <LoadingSpinner />}
        {recruitsStatus === "success" && (
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
                  color: teal[500],
                  backgroundColor: teal[100],
                  borderRadius: "5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "40px",
                }}
              >
                <Box>募集</Box>
              </Box>
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
                onClick={() => router.push("/even_location_events")}
              >
                <Box>イベント</Box>
              </Box>
            </Box>
            <Box sx={{ marginBottom: "10px" }}>
              全{recruitsData.totalCount}中{recruitsData.currentPage}ページ目
            </Box>
            <Grid container spacing={2}>
              {recruitsData.recruits.map((recruit, index) => (
                <Grid key={index} item xs={12} sm={6} md={4}>
                  <RecruitCard
                    recruit={recruit}
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
                count={recruitsData.totalPages}
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
