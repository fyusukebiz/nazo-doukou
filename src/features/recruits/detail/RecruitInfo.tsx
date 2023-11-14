import { UserAvatarWithName } from "@/components/avatars/UserAvatarWithName";
import { useIsMobileContext } from "@/features/common/IsMobileProvider";
import { useDisclosure } from "@/hooks/useDisclosure";
import { RecruitDetail } from "@/types/recruit";
import { Box, Chip, IconButton } from "@mui/material";
import { blue, grey, teal } from "@mui/material/colors";
import { format } from "date-fns";
import Link from "next/link";
import { ReactNode, useMemo } from "react";
import { Yusei_Magic } from "next/font/google";
import { PiCaretDownBold, PiCaretUpBold } from "react-icons/pi";

const yuseiMagic = Yusei_Magic({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
});

const toCircled = (num: number) => {
  if (num <= 20) {
    const base = "①".charCodeAt(0);
    return String.fromCharCode(base + num - 1);
  }
  if (num <= 35) {
    const base = "㉑".charCodeAt(0);
    return String.fromCharCode(base + num - 21);
  }
  const base = "㊱".charCodeAt(0);
  return String.fromCharCode(base + num - 36);
};

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
      {location && <RecruitItem item="場所" content={location} />}

      <RecruitItem
        item="候補日"
        content={recruit.possibleDates
          .sort((a, b) => {
            // 数字が小さい方が、配列の頭（左側）の方に配置される, nullは最後
            if (typeof a.priority === "undefined") {
              return 1;
            }
            if (typeof b.priority === "undefined") {
              return -1;
            }
            if (a.priority === b.priority) {
              return 0;
            }
            return a.priority < b.priority ? -1 : 1;
          })
          .map((date, index) =>
            date.priority
              ? toCircled(index + 1) + format(new Date(date.date), "MM/d")
              : format(new Date(date.date), "MM/d")
          )
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
                  <IconButton
                    onClick={onToggleUserDetail}
                    sx={{
                      marginLeft: "10px",
                      height: "30px",
                      color: blue[500],
                    }}
                    size="small"
                  >
                    {isUserDetailOpen ? <PiCaretUpBold /> : <PiCaretDownBold />}
                  </IconButton>
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
                              color="teal"
                              variant="filled"
                              size="small"
                              sx={{ height: "30px" }}
                            />
                          ))}
                      </Box>
                    }
                  />
                )}

              {recruit.user.userStrongAreas &&
                recruit.user.userStrongAreas.length > 0 && (
                  <UserItem
                    item="得意なこと"
                    content={
                      <Box
                        sx={{
                          display: "flex",
                          gap: "10px",
                          flexWrap: "wrap",
                        }}
                      >
                        {recruit.user.userStrongAreas.map((usa, index) => (
                          <Chip
                            key={index}
                            label={usa.strongArea.name}
                            color="teal"
                            variant="filled"
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

      {recruit.numberOfPeople && (
        <RecruitItem item="募集人数" content={recruit.numberOfPeople + "人"} />
      )}

      {recruit.recruitTags.length > 0 && (
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
      )}

      {recruit.description && <Box>{recruit.description}</Box>}
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
