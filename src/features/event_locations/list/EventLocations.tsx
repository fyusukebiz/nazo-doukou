import { LoadingSpinner } from "@/components/spinners/LoadingSpinner";
import { useEventLocationsQuery } from "@/react_queries/event_locations/useEventLocationsQuery";
import { Box, Container, Grid, Pagination } from "@mui/material";
import { useRouter } from "next/router";
import {
  ChangeEvent,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PcEventLocationCard } from "./misc/PcEventLocationCard";
import { useRouterHistoryContext } from "../../common/RouterHistoryProvider";
import { blue, grey } from "@mui/material/colors";
import { Yusei_Magic } from "next/font/google";
import { useIsMobileContext } from "@/features/common/IsMobileProvider";
import { MobileEventLocationCard } from "./misc/MobileEventLocationCard";
import { TwitterShareButton, XIcon } from "react-share";
import { FaSearch } from "react-icons/fa";
import { useDisclosure } from "@/hooks/useDisclosure";
import { EventLocationSearchDialog } from "./misc/EventLocationSearchDialog";
import {
  EventLocationSearchFormProvider,
  EventLocationSearchFormSchema,
  defaultEventLocationSearchFormValues,
} from "./misc/EventLocationSearchFormProvider";

const yuseiMagic = Yusei_Magic({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
});

export const EventLocations = () => {
  const router = useRouter();
  const { isMobile } = useIsMobileContext();
  const [page, setPage] = useState(Number(router.query.page || 1));
  const [isInitialized, setIsInitialized] = useState(false);
  const [queryParams, setQueryParams] = useState<EventLocationSearchFormSchema>(
    defaultEventLocationSearchFormValues
  );

  // react-hook-formに入った値をreact-query用に変換
  const formattedQueryParams = useMemo(
    () => ({
      ...(queryParams.eventName && { eventName: queryParams.eventName }),
      ...(queryParams.locations && {
        locationIds: queryParams.locations.map((loc) => loc.value),
      }),
      ...(queryParams.gameTypes && {
        gameTypeIds: queryParams.gameTypes.map((type) => type.value),
      }),
      ...(queryParams.date && { date: queryParams.date }),
    }),
    [queryParams]
  );

  const { data: eventLocationsData, status: eventLocationsStatus } =
    useEventLocationsQuery(
      { query: { page, params: formattedQueryParams } },
      isInitialized
    );

  const {
    isOpen: isSearchModalOpen,
    onOpen: onOpenSearchModal,
    onClose: onCloseSearchModal,
  } = useDisclosure();

  const handleClickPage = (event: ChangeEvent<unknown>, _page: number) => {
    setPage(_page);
    sessionStorage.setItem("eventLocationSearchPage", _page.toString());
  };

  // ページを切り替える時、スクロールを上までも戻す
  const listBoxRef = useRef<HTMLHRElement>(null);
  const { routerHistory } = useRouterHistoryContext();

  // 初期フェッチ後のスクロール
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
    <EventLocationSearchFormProvider>
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
              <Box>フォローしてね！⇨</Box>
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
                backgroundColor: grey[100],
                color: grey[500],
                borderRadius: "5px 0px 0px 5px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "35px",
                cursor: "pointer",
              }}
              onClick={() => router.push("/recruits")}
            >
              謎解き同行者募集
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
                height: "35px",
              }}
            >
              謎解きイベント
            </Box>
          </Box>

          {/* 検索ボタン */}
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                height: "35px",
                maxWidth: "400px",
                color: grey[500],
                border: "1px solid",
                borderColor: grey[500],
                borderRadius: "5px",
                padding: "0px 12px",
                cursor: "pointer",
                marginBottom: "15px",
              }}
              onClick={onOpenSearchModal}
            >
              <FaSearch size={20} />
              <Box sx={{ marginLeft: "15px" }}>検索</Box>
            </Box>
          </Box>
          <EventLocationSearchDialog
            isOpen={isSearchModalOpen}
            onClose={onCloseSearchModal}
            setQueryParams={setQueryParams}
            setIsInitialized={setIsInitialized}
            setPage={setPage}
          />

          {eventLocationsStatus !== "success" && <LoadingSpinner />}
          {eventLocationsStatus === "success" && (
            <>
              <Grid container spacing={2}>
                {eventLocationsData.eventLocations.map(
                  (eventLocation, index) => (
                    <Grid key={index} item xs={12} sm={6} md={4}>
                      {isMobile ? (
                        <MobileEventLocationCard
                          eventLocation={eventLocation}
                          saveScrollPosition={saveScrollPosition}
                        />
                      ) : (
                        <PcEventLocationCard
                          eventLocation={eventLocation}
                          saveScrollPosition={saveScrollPosition}
                        />
                      )}
                    </Grid>
                  )
                )}
              </Grid>
              <Box sx={{ paddingBottom: "80px" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "20px",
                  }}
                >
                  <Pagination
                    count={eventLocationsData.totalPages}
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
                  全{eventLocationsData.totalCount}個中
                  {eventLocationsData.currentPage}
                  ページ目
                </Box>
              </Box>
            </>
          )}
        </Container>
      </Box>
    </EventLocationSearchFormProvider>
  );
};
