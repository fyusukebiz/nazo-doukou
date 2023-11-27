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
import { MobileRecruitCard } from "./misc/MobileRecruitCard";
import { useRouterHistoryContext } from "../../common/RouterHistoryProvider";
import { grey, teal, blue } from "@mui/material/colors";
import { FaSearch } from "react-icons/fa";
import { PcRecruitCard } from "./misc/PcRecruitCard";
import { useIsMobileContext } from "@/features/common/IsMobileProvider";
import { Yusei_Magic } from "next/font/google";
import { TwitterShareButton, XIcon } from "react-share";
import { GoPlusCircle } from "react-icons/go";
import { useFirebaseAuthContext } from "@/components/providers/FirebaseAuthProvider";

const yuseiMagic = Yusei_Magic({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
});

export const Recruits = () => {
  const router = useRouter();
  const { currentFbUser } = useFirebaseAuthContext();
  const { isMobile } = useIsMobileContext();
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
        {/* 通知＆シェアボタン */}
        <Box
          sx={{
            border: "1px solid",
            borderColor: blue[300],
            borderRadius: "10px",
            marginBottom: "15px",
            padding: "5px 7px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              maxWidth: "350px",
            }}
          >
            <Box>2023/11/17リリース</Box>
            <Box>フォローしてね！</Box>
            <TwitterShareButton
              url={process.env.NEXT_PUBLIC_TWITTER_URL || ""}
              style={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <XIcon size={30} round />
            </TwitterShareButton>
          </Box>
        </Box>
        {/* 募集 or イベント */}
        <Box
          sx={{
            display: "flex",
            textAlign: "center",
            fontSize: "18px",
            marginBottom: "15px",
          }}
          className={yuseiMagic.className}
        >
          <Box
            sx={{
              width: "50%",
              height: "35px",
              color: teal[500],
              backgroundColor: teal[100],
              borderRadius: "5px 0px 0px 5px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            謎解き同行者募集
          </Box>
          <Box
            sx={{
              width: "50%",
              height: "35px",
              color: grey[500],
              backgroundColor: grey[100],
              borderRadius: "0px 5px 5px 0px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            onClick={() => router.push("/event_locations")}
          >
            謎解きイベント
          </Box>
        </Box>

        {/* 検索 */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "15px",
          }}
        >
          <OutlinedInput
            size="small"
            sx={{ maxWidth: "500px", width: "400px" }}
            value={freeWord}
            placeholder="タイトルで検索"
            onChange={(e) => setFreeWord(e.target.value)}
            inputProps={{
              style: {
                height: "35px",
                padding: "0 5px",
              },
            }}
            startAdornment={
              <InputAdornment position="start">
                <FaSearch size={20} />
              </InputAdornment>
            }
          />
          <ButtonGroup
            sx={{ height: "35px", border: `1px solid ${grey[300]}` }}
          >
            <Button
              size="medium"
              variant={orderBy === "createdAt" ? "contained" : "text"}
              color="teal"
              sx={{ width: "70px", padding: "0px" }}
              onClick={() => setOrderBy("createdAt")}
              disableElevation
            >
              作成日順
            </Button>
            <Button
              size="medium"
              variant={orderBy === "possibleDate" ? "contained" : "text"}
              color="teal"
              sx={{ width: "70px", padding: "0px" }}
              onClick={() => setOrderBy("possibleDate")}
              disableElevation
            >
              希望日順
            </Button>
          </ButtonGroup>
        </Box>

        <Box sx={{ display: "flex", marginBottom: "15px" }}>
          <Button
            sx={{ marginLeft: "auto" }}
            variant="contained"
            color="info"
            size="small"
            startIcon={<GoPlusCircle size={20} />}
            onClick={() => {
              router.push(!!currentFbUser ? "/recruits/new" : "/auth/signup");
            }}
          >
            新規募集
          </Button>
        </Box>

        {/* 検索結果 */}
        {recruitsStatus === "pending" && <LoadingSpinner />}
        {recruitsStatus === "success" && (
          <>
            <Grid container spacing={2}>
              {recruitsData.recruits.map((recruit, index) => (
                <Grid key={index} item xs={12} sm={6} md={4}>
                  {isMobile ? (
                    <MobileRecruitCard
                      recruit={recruit}
                      saveScrollPosition={saveScrollPosition}
                    />
                  ) : (
                    <PcRecruitCard
                      recruit={recruit}
                      saveScrollPosition={saveScrollPosition}
                    />
                  )}
                </Grid>
              ))}
            </Grid>
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "20px",
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
              <Box sx={{ textAlign: "right", marginTop: "10px" }}>
                全{recruitsData.totalCount}個中{recruitsData.currentPage}
                ページ目
              </Box>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
};
