import { LoadingSpinner } from "@/components/spinners/LoadingSpinner";
import { Box, Button, Container, Grid, Pagination } from "@mui/material";
import { useRouter } from "next/router";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { RecruitCard } from "./misc/RecruitCard";
import { useRouterHistoryContext } from "@/features/common/RouterHistoryProvider";
import Link from "next/link";
import { blue, grey, teal } from "@mui/material/colors";
import { useRecruitsQueryByAdmin } from "@/react_queries/admin/recruits/useRecruitsQueryByAdmin";

export const AdminRecruits = () => {
  const router = useRouter();
  const [page, setPage] = useState(Number(router.query.page || 1));
  const { data: recruitsData, status: recruitsStatus } =
    useRecruitsQueryByAdmin({
      query: { page },
    });

  const handleClickPage = (event: ChangeEvent<unknown>, _page: number) => {
    sessionStorage.setItem("recruitListPage", _page.toString()); // 次回戻ってきた時用
    setPage(_page); // ページを切り替え
  };

  // ページを切り替える時、スクロールを上までも戻す
  const listBoxRef = useRef<HTMLHRElement>(null);
  const { routerHistory } = useRouterHistoryContext();

  // 初期レンダリング時のスクロール
  useEffect(() => {
    if (recruitsStatus !== "success") return;
    if (/^\/admin\/events\//.test(routerHistory[1])) {
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
                fontSize: "18px",
              }}
            >
              <Box
                sx={{
                  width: "50%",
                  backgroundColor: teal[100],
                  color: teal[500],
                  borderRadius: "5px 0px 0px 5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "40px",
                }}
              >
                同行者募集(by管理)
              </Box>
              <Box
                sx={{
                  width: "50%",
                  color: grey[500],
                  backgroundColor: grey[100],
                  borderRadius: "0px 5px 5px 0px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "40px",
                  cursor: "pointer",
                }}
                onClick={() => router.push("/admin/events")}
              >
                イベント
              </Box>
            </Box>

            <Box sx={{ display: "flex" }}>
              <Link
                href="/admin/recruits/new"
                style={{ textDecoration: "none", marginLeft: "auto" }}
                passHref
              >
                <Button variant="outlined" size="large">
                  新規作成
                </Button>
              </Link>
            </Box>
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
              }}
            >
              <Pagination
                count={recruitsData.totalPages}
                page={page}
                boundaryCount={0}
                siblingCount={2}
                color="standard"
                shape="circular"
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
