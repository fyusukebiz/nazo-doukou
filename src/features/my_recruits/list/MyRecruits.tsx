import { LoadingSpinner } from "@/components/spinners/LoadingSpinner";
import { useRecruitsQuery } from "@/react_queries/recruits/useRecruitsQuery";
import { Box, Container, Grid, Pagination } from "@mui/material";
import { useRouter } from "next/router";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { RecruitCard } from "./misc/RecruitCard";
import { useRouterHistoryContext } from "../../common/RouterHistoryProvider";
import { SubPageHeader } from "@/components/layouts/SubPageHeader";

export const MyRecruits = () => {
  const router = useRouter();
  const [page, setPage] = useState(Number(router.query.page || 1));
  const { data: recruitsData, status: recruitsStatus } = useRecruitsQuery({
    query: { page, onlyMine: true },
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
    if (/^\/my_recruits\//.test(routerHistory[1])) {
      // イベント詳細から戻ってきた場合、前回のスクロール位置を復元
      const posY = sessionStorage.getItem("myRecruitListPosY");
      if (posY) listBoxRef.current?.scroll(0, Number(posY));
    } else {
      // その他の場合、トップにスクロール
      listBoxRef.current?.scroll(0, 0);
    }
    sessionStorage.removeItem("myRecruitListPosY");
  }, [routerHistory, recruitsStatus]);

  const saveScrollPosition = useCallback(() => {
    const posY = listBoxRef.current?.scrollTop;
    if (posY) {
      sessionStorage.setItem("myRecruitListPosY", String(posY));
    }
  }, []);

  return (
    <Box ref={listBoxRef} sx={{ height: "100%", overflowY: "scroll" }}>
      <SubPageHeader title="マイ募集一覧" />
      {recruitsStatus === "pending" && <LoadingSpinner />}
      {recruitsStatus === "success" && (
        <Container sx={{ padding: "16px" }} maxWidth="xl">
          <Box sx={{ marginBottom: "10px" }}>
            全{recruitsData.totalCount}個中{recruitsData.currentPage}ページ目
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
        </Container>
      )}
    </Box>
  );
};
