import { LoadingSpinner } from "@/components/spinners/LoadingSpinner";
import { useRecruitsQuery } from "@/react_queries/recruits/useRecruitsQuery";
import {
  Box,
  Button,
  ButtonGroup,
  Container,
  Grid,
  InputAdornment,
  OutlinedInput,
  Pagination,
} from "@mui/material";
import { useRouter } from "next/router";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { RecruitCard } from "./misc/RecruitCard";
import { useRouterHistoryContext } from "../../common/RouterHistoryProvider";
import { grey, teal } from "@mui/material/colors";
import { FaSearch } from "react-icons/fa";

export const Recruits = () => {
  const router = useRouter();
  const [page, setPage] = useState(Number(router.query.page || 1));
  const [freeWord, setFreeWord] = useState("");
  const [orderBy, setOrderBy] = useState<"createdAt" | "possibleDate">(
    "createdAt"
  );
  const { data: recruitsData, status: recruitsStatus } = useRecruitsQuery({
    query: { page, freeWord, orderBy },
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
        {/* 募集 or イベント */}
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
              color: teal[500],
              backgroundColor: teal[100],
              borderRadius: "5px 0px 0px 5px",
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
              color: grey[500],
              borderRadius: "0px 5px 5px 0px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "40px",
              cursor: "pointer",
            }}
            onClick={() => router.push("/event_locations")}
          >
            <Box>イベント</Box>
          </Box>
        </Box>

        {/* 検索 */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginY: "20px",
          }}
        >
          <OutlinedInput
            size="small"
            sx={{ maxWidth: "500px", width: "400px" }}
            value={freeWord}
            onChange={(e) => setFreeWord(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <FaSearch size={20} />
              </InputAdornment>
            }
          />
          <ButtonGroup
            sx={{ height: "40px", border: `1px solid ${grey[300]}` }}
          >
            <Button
              size="medium"
              variant={orderBy === "createdAt" ? "contained" : "text"}
              sx={{ width: "70px", padding: "0px" }}
              onClick={() => setOrderBy("createdAt")}
              disableElevation
            >
              作成日順
            </Button>
            <Button
              size="medium"
              variant={orderBy === "possibleDate" ? "contained" : "text"}
              sx={{ width: "70px", padding: "0px" }}
              onClick={() => setOrderBy("possibleDate")}
              disableElevation
            >
              希望日順
            </Button>
          </ButtonGroup>
        </Box>

        {/* 検索結果 */}
        {recruitsStatus === "pending" && <LoadingSpinner />}
        {recruitsStatus === "success" && (
          <>
            <Box sx={{ marginBottom: "10px" }}>
              全{recruitsData.totalCount}個中{recruitsData.currentPage}
              ページ目
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
