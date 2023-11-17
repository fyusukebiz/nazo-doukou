import { CommentToRecruit as CommentToRecruitType } from "@/types/commentToRecruit";
import { formatDateTimeFlex } from "@/utils/formatDateTimeFlex";
import { Box, IconButton, Menu, MenuItem } from "@mui/material";
import { grey } from "@mui/material/colors";
import { getCookie } from "cookies-next";
import {
  QueryObserverResult,
  RefetchOptions,
  // useQueryClient,
} from "@tanstack/react-query";
import { useDeleteCommentToRecruit } from "@/react_queries/comments_to_recruit/useDeleteCommentToRecruit";
import { useState } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import { UserAvatar } from "@/components/avatars/UserAvatar";
import { GetRecruitResponseSuccessBody } from "@/pages/api/recruits/[id]";
import { insertLinkInText } from "@/utils/insertLinkInText";

type Props = {
  commentToRecruit: CommentToRecruitType;
  refetchRecruit: (
    options?: RefetchOptions | undefined
  ) => Promise<QueryObserverResult<GetRecruitResponseSuccessBody, Error>>;
};

export const CommentToRecruit = (props: Props) => {
  const { commentToRecruit, refetchRecruit } = props;
  const userId = getCookie("userId") as string;

  const { deleteCommentToRecruit } = useDeleteCommentToRecruit();
  // const queryClient = useQueryClient();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const commenterIsMe = commentToRecruit.user?.id === userId;

  const handleDeletePost = () => {
    handleClose();
    deleteCommentToRecruit.mutate(
      { path: { commentToRecruitId: commentToRecruit.id } },
      {
        onSuccess: () => {
          // queryClient.invalidateQueries({ queryKey: ["getRecruit"] });
          refetchRecruit();
        },
      }
    );
  };

  return (
    <Box sx={{ display: "flex", alignItems: "start", gap: "10px" }}>
      {/* アバター表示 */}
      <UserAvatar user={commentToRecruit.user} size={50} />

      {/* 投稿の内容 */}
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ fontSize: "18px", marginBottom: "5px" }}>
          {commentToRecruit.user.name}
        </Box>
        <Box
          sx={{
            color: "black",
            borderRadius: "12px",
            padding: "12px",
            border: `1px solid ${grey[300]}`,
            background: grey[100],
            whiteSpace: "pre-wrap",
          }}
          className="word-wrap"
          dangerouslySetInnerHTML={{
            __html: insertLinkInText(commentToRecruit.message),
          }}
        ></Box>

        {/* 投稿時間、ボタン類 */}
        <Box sx={{ display: "flex", marginTop: "5px" }}>
          {/* 投稿時間 */}
          <Box
            sx={{
              display: "flex",
              fontSize: "10px",
              color: grey[700],
            }}
          >
            {formatDateTimeFlex({
              rawDate: commentToRecruit.createdAt,
              hideYear: true,
            })}
          </Box>
          {/* ボタン類 */}
          {commenterIsMe && (
            <>
              <IconButton
                aria-label="more"
                onClick={handleClick}
                size="small"
                sx={{ marginLeft: "auto" }}
              >
                <FiMoreHorizontal />
              </IconButton>
              <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                <MenuItem onClick={handleDeletePost}>削除</MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};
