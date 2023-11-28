import { SubPageHeader } from "@/components/layouts/SubPageHeader";
import { LoadingSpinner } from "@/components/spinners/LoadingSpinner";
import { useRecruitQuery } from "@/react_queries/recruits/useRecruitQuery";
import { Box, Container, Divider } from "@mui/material";
import { grey } from "@mui/material/colors";
import { useRouter } from "next/router";
import { RecruitInfo } from "./RecruitInfo";
import { CommentsToRecruit } from "./CommentsToRecruit";
import Link from "next/link";

export const Recruit = () => {
  const router = useRouter();
  const recruitId = router.query.id as string;
  const {
    data: recruitData,
    status: recruitStatus,
    refetch: refetchRecruit,
  } = useRecruitQuery({
    path: { recruitId },
  });

  // TODO: ブラウザバックしたときに正しく動かない、react-queryかブラウザのバグ？
  // const handleChangeTab = useCallback(
  //   (event: SyntheticEvent, newValue: Tab) => {
  // router.push(`/recruits/${recruitId}?tab=${newValue}`, undefined, {
  //   shallow: true,
  // });
  //   },
  //   []
  // );

  // 初回の設定
  // useEffect(() => {
  //   if (!router.isReady) return;
  //   const InitialTab = router.query.tab as Tab | undefined;
  //   console.log("tab", tab);
  //   // console.log("router.pathname", router.pathname);
  //   console.log("router.asPath", router.asPath);
  //   // console.log(router.pathname.split("?")[1] === tab);
  //   if (router.asPath.split("tab=")[1] === tab) return;

  //   if (InitialTab) {
  //     setTab(InitialTab);
  //     router.push(`/recruits/${recruitId}?tab=${InitialTab}`, undefined, {
  //       shallow: true,
  //     });
  //   } else {
  //     router.push(`/recruits/${recruitId}?tab=recruitInfo`, undefined, {
  //       shallow: true,
  //     });
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [router]);

  return (
    <Box sx={{ height: "100%", overflowY: "scroll" }}>
      <SubPageHeader title="募集詳細" path="/recruits" />
      {recruitStatus === "pending" && <LoadingSpinner />}
      {recruitStatus === "success" && (
        <Container maxWidth="sm" sx={{ padding: "24px" }}>
          <Box sx={{ marginBottom: "15px" }}>
            {recruitData.recruit.eventLocation ? (
              <img
                src={recruitData.recruit.eventLocation.event.coverImageFileUrl}
                style={{
                  objectFit: "cover",
                  maxHeight: "220px",
                  width: "100%",
                  cursor: "pointer",
                  borderRadius: "10px",
                }}
                alt="image"
              />
            ) : (
              <Box
                sx={{
                  height: "220px",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  borderRadius: "10px",
                  backgroundColor: grey[400],
                }}
              >
                <Box sx={{ color: grey[600], fontSize: "36px" }}>NO IMAGE</Box>
              </Box>
            )}
          </Box>

          {/* イベント名 */}
          <Box sx={{ fontSize: "20px" }}>
            {recruitData.recruit.manualEventName
              ? recruitData.recruit.manualEventName
              : recruitData.recruit.eventLocation!.event.name}
          </Box>

          {recruitData.recruit.eventLocation?.id && (
            <Box sx={{ display: "flex", marginY: "7px" }}>
              <Link
                href={`/event_locations/${recruitData.recruit.eventLocation.id}`}
                style={{ marginLeft: "auto" }}
              >
                イベント詳細
              </Link>
            </Box>
          )}

          {recruitData.recruit && (
            <>
              <RecruitInfo recruit={recruitData.recruit} />
              {recruitData.recruit.user && (
                <>
                  <Divider sx={{ marginY: "20px" }} />
                  <CommentsToRecruit
                    recruit={recruitData.recruit}
                    refetchRecruit={refetchRecruit}
                  />
                </>
              )}
            </>
          )}
        </Container>
      )}
    </Box>
  );
};
