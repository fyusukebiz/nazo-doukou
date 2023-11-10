import { UserAvatar } from "@/components/avatars/UserAvatar";
import { SubPageHeader } from "@/components/layouts/SubPageHeader";
import { LoadingSpinner } from "@/components/spinners/LoadingSpinner";
import { useIsMobileContext } from "@/features/common/IsMobileProvider";
import { useDisclosure } from "@/hooks/useDisclosure";
import { useRecruitQuery } from "@/react_queries/recruits/useRecruitQuery";
import { Box, Button, Chip, Container } from "@mui/material";
import { grey, teal } from "@mui/material/colors";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useMemo } from "react";

export const Recruit = () => {
  const router = useRouter();
  const recruitId = router.query.id as string;

  const { data: recruitData, status: recruitStatus } = useRecruitQuery({
    path: { recruitId },
  });

  const { isOpen: isUserDetailOpen, onToggle: onToggleUserDetail } =
    useDisclosure();

  const location = useMemo(() => {
    if (recruitStatus !== "success") return "";
    if (recruitData.recruit.manualLocation) {
      return recruitData.recruit.manualLocation;
    } else {
      return (
        recruitData.recruit.eventLocation!.location.name +
        (recruitData.recruit.eventLocation!.building
          ? " / " + recruitData.recruit.eventLocation!.building
          : "")
      );
    }
  }, [recruitData, recruitStatus]);

  const haveInfo = useMemo(() => {
    const user = recruitData?.recruit.user;
    if (!user) return false;

    return (
      !!user.age ||
      !!user.description ||
      !!user.instagram ||
      !!user.sex ||
      !!user.startedAt ||
      !!user.twitter ||
      (user.userGameTypes && user.userGameTypes.length > 0)
    );
  }, [recruitData?.recruit.user]);

  return (
    <Box sx={{ height: "100%", overflowY: "scroll" }}>
      <SubPageHeader title="募集詳細" />
      {recruitStatus === "pending" && <LoadingSpinner />}
      {recruitStatus === "success" && (
        <Container maxWidth="sm" sx={{ padding: "24px" }}>
          <Box>
            {recruitData.recruit.eventLocation ? (
              <img
                src={recruitData.recruit.eventLocation.event.coverImageFileUrl}
                style={{
                  objectFit: "cover",
                  maxHeight: "220px",
                  width: "100%",
                  marginBottom: "8px",
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
                  marginBottom: "8px",
                  cursor: "pointer",
                  borderRadius: "10px",
                  backgroundColor: grey[400],
                }}
              >
                <Box sx={{ color: grey[600], fontSize: "36px" }}>NO IMAGE</Box>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              marginTop: "10px",
            }}
          >
            {/* イベント名 */}
            <Box sx={{ fontSize: "20px" }}>
              {recruitData.recruit.manualEventName
                ? recruitData.recruit.manualEventName
                : recruitData.recruit.eventLocation!.event.name}
            </Box>

            {recruitData.recruit.eventLocation?.id && (
              <RecruitItem
                item="イベント"
                content={
                  <Link
                    href={`/event_locations/${recruitData.recruit.eventLocation.id}`}
                  >
                    リンク
                  </Link>
                }
              />
            )}

            {location && <RecruitItem item="場所" content={location} />}

            <RecruitItem
              item="候補日"
              content={recruitData.recruit.possibleDates
                .map((date) => format(new Date(date.date), "MM/d"))
                .join(", ")}
            />

            {/* TODO: アイコンとtwitterリンクを設置すること */}
            {recruitData.recruit.user && (
              <>
                <RecruitItem
                  item="募集者"
                  content={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <UserAvatar user={recruitData.recruit.user} size={30} />
                      <Box>{recruitData.recruit.user.name}</Box>
                      {haveInfo && (
                        <Button
                          variant="text"
                          onClick={onToggleUserDetail}
                          sx={{ marginLeft: "auto", height: "30px" }}
                          size="small"
                        >
                          詳細
                        </Button>
                      )}
                    </Box>
                  }
                />
                {isUserDetailOpen && (
                  <Box
                    sx={{
                      borderTop: `1px solid ${grey[300]}`,
                      borderBottom: `1px solid ${grey[300]}`,
                      padding: "10px 0px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "15px",
                    }}
                  >
                    {recruitData.recruit.user.startedAt && (
                      <UserItem
                        item="謎解き歴"
                        content={`${format(
                          new Date(recruitData.recruit.user.startedAt),
                          "yyyy年M月"
                        )}ぐらいから`}
                      />
                    )}
                    {recruitData.recruit.user.twitter && (
                      <UserItem
                        item="Xアカウント"
                        content={
                          <a
                            href={`https://twitter.com/${recruitData.recruit.user.twitter}`}
                            target="_blank"
                          >
                            リンク
                          </a>
                        }
                      />
                    )}
                    {recruitData.recruit.user.instagram && (
                      <UserItem
                        item="インスタ"
                        content={
                          <a
                            href={`https://www.instagram.com/${recruitData.recruit.user.instagram}`}
                            target="_blank"
                          >
                            リンク
                          </a>
                        }
                      />
                    )}
                    {recruitData.recruit.user.userGameTypes &&
                      recruitData.recruit.user.userGameTypes.length > 0 && (
                        <UserItem
                          item="好きなゲーム"
                          content={
                            <Box
                              sx={{
                                display: "flex",
                                gap: "10px",
                                flexWrap: "wrap",
                              }}
                            >
                              {recruitData.recruit.user.userGameTypes
                                .filter((ugt) => ugt.likeOrDislike === "LIKE")
                                .map((ugt, index) => (
                                  <Chip
                                    key={index}
                                    label={ugt.gameType.name}
                                    color="primary"
                                    variant="filled"
                                    size="small"
                                    sx={{ height: "30px" }}
                                  />
                                ))}
                            </Box>
                          }
                        />
                      )}
                    {recruitData.recruit.user.userGameTypes &&
                      recruitData.recruit.user.userGameTypes.length > 0 && (
                        <UserItem
                          item="嫌いなゲーム"
                          content={
                            <Box
                              sx={{
                                display: "flex",
                                gap: "10px",
                                flexWrap: "wrap",
                              }}
                            >
                              {recruitData.recruit.user.userGameTypes
                                .filter(
                                  (ugt) => ugt.likeOrDislike === "DISLIKE"
                                )
                                .map((ugt, index) => (
                                  <Chip
                                    key={index}
                                    label={ugt.gameType.name}
                                    color="secondary"
                                    // variant="filled"
                                    size="small"
                                    sx={{ height: "30px" }}
                                  />
                                ))}
                            </Box>
                          }
                        />
                      )}
                    {recruitData.recruit.user.description && (
                      <UserItem
                        item="自由記入欄"
                        content={recruitData.recruit.user.description}
                      />
                    )}
                  </Box>
                )}
              </>
            )}

            {recruitData.recruit.user?.twitter && (
              <RecruitItem
                item="Xアカウント"
                content={recruitData.recruit.user.twitter}
              />
            )}

            {recruitData.recruit.numberOfPeople && (
              <RecruitItem
                item="募集人数"
                content={recruitData.recruit.numberOfPeople + "人"}
              />
            )}

            {recruitData.recruit.recruitTags.length > 0 && (
              <RecruitItem
                item="タグ"
                content={
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "5px",
                    }}
                  >
                    {recruitData.recruit.recruitTags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag.name}
                        size="small"
                        sx={{ height: "30px" }}
                      />
                    ))}
                  </Box>
                }
              />
            )}

            {recruitData.recruit.description && (
              <RecruitItem
                item="詳細"
                content={recruitData.recruit.description}
              />
            )}
          </Box>
        </Container>
      )}
    </Box>
  );
};

const RecruitItem = ({
  item,
  content,
}: {
  item: string;
  content: ReactNode;
}) => {
  const { isMobile } = useIsMobileContext();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "start",
        gap: isMobile ? "0px" : "20px",
      }}
    >
      <Box sx={{ width: "100px", flexShrink: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "90px",
            backgroundColor: teal[100],
            height: "30px",
            borderRadius: "4px",
            flexShrink: 0,
          }}
        >
          <Box
            sx={{ color: teal[700], fontSize: "14px" }}
            className="word-wrap"
          >
            {item}
          </Box>
        </Box>
      </Box>
      <Box sx={{ flexGrow: 1, lineHeight: "30px" }}>{content}</Box>
    </Box>
  );
};

const UserItem = ({ item, content }: { item: string; content: ReactNode }) => {
  const { isMobile } = useIsMobileContext();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "start",
        gap: isMobile ? "0px" : "20px",
      }}
    >
      <Box sx={{ width: "100px", flexShrink: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "90px",
            // backgroundColor: teal[100],
            height: "30px",
            borderRadius: "4px",
            flexShrink: 0,
          }}
        >
          <Box sx={{ color: teal[700], fontSize: "14px" }}>{item}</Box>
        </Box>
      </Box>
      <Box sx={{ flexGrow: 1, lineHeight: "30px" }} className="word-wrap">
        {content}
      </Box>
    </Box>
  );
};
