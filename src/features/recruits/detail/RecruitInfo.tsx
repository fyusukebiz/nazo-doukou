import { UserAvatar } from "@/components/avatars/UserAvatar";
import { UserAvatarWithName } from "@/components/avatars/UserAvatarWithName";
import { useIsMobileContext } from "@/features/common/IsMobileProvider";
import { useDisclosure } from "@/hooks/useDisclosure";
import { RecruitDetail } from "@/types/recruit";
import { Box, Button, Chip } from "@mui/material";
import { grey, teal } from "@mui/material/colors";
import { format } from "date-fns";
import Link from "next/link";
import { ReactNode, useMemo } from "react";
import { Yusei_Magic } from "next/font/google";

const yuseiMagic = Yusei_Magic({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
});

type Props = {
  recruit: RecruitDetail;
};

export const RecruitInfo = (props: Props) => {
  const { recruit } = props;

  const { isOpen: isUserDetailOpen, onToggle: onToggleUserDetail } =
    useDisclosure();

  const location = useMemo(() => {
    if (recruit.manualLocation) {
      return recruit.manualLocation;
    } else {
      return (
        recruit.eventLocation!.location.name +
        (recruit.eventLocation!.building
          ? " / " + recruit.eventLocation!.building
          : "")
      );
    }
  }, [recruit]);

  const haveInfo = useMemo(() => {
    const user = recruit.user;
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
  }, [recruit.user]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "15px",
      }}
    >
      {recruit.eventLocation?.id && (
        <RecruitItem
          item="イベント"
          content={
            <Link href={`/event_locations/${recruit.eventLocation.id}`}>
              リンク
            </Link>
          }
        />
      )}

      {location && <RecruitItem item="場所" content={location} />}

      <RecruitItem
        item="候補日"
        content={recruit.possibleDates
          .map((date) => format(new Date(date.date), "MM/d"))
          .join(", ")}
      />

      {/* TODO: アイコンとtwitterリンクを設置すること */}
      {recruit.user && (
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
                <UserAvatarWithName user={recruit.user} size={30} />
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
              {recruit.user.startedAt && (
                <UserItem
                  item="謎解き歴"
                  content={`${format(
                    new Date(recruit.user.startedAt),
                    "yyyy年M月"
                  )}ぐらいから`}
                />
              )}
              {recruit.user.twitter && (
                <UserItem
                  item="Xアカウント"
                  content={
                    <Link
                      href={`https://twitter.com/${recruit.user.twitter}`}
                      target="_blank"
                    >
                      リンク
                    </Link>
                  }
                />
              )}
              {recruit.user.instagram && (
                <UserItem
                  item="インスタ"
                  content={
                    <Link
                      href={`https://www.instagram.com/${recruit.user.instagram}`}
                      target="_blank"
                    >
                      リンク
                    </Link>
                  }
                />
              )}
              {recruit.user.userGameTypes &&
                recruit.user.userGameTypes.length > 0 && (
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
                        {recruit.user.userGameTypes
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
              {recruit.user.userGameTypes &&
                recruit.user.userGameTypes.length > 0 && (
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
                        {recruit.user.userGameTypes
                          .filter((ugt) => ugt.likeOrDislike === "DISLIKE")
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
              {recruit.user.description && (
                <UserItem
                  item="自由記入欄"
                  content={recruit.user.description}
                />
              )}
            </Box>
          )}
        </>
      )}

      {recruit.user?.twitter && (
        <RecruitItem item="Xアカウント" content={recruit.user.twitter} />
      )}

      {recruit.numberOfPeople && (
        <RecruitItem item="募集人数" content={recruit.numberOfPeople + "人"} />
      )}

      {recruit.recruitTags.length > 0 && (
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
              {recruit.recruitTags.map((tag, index) => (
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

      {recruit.description && (
        <RecruitItem item="詳細" content={recruit.description} />
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
          className={yuseiMagic.className}
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
          className={yuseiMagic.className}
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
