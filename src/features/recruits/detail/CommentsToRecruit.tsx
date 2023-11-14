import { RecruitDetail } from "@/types/recruit";
import { Box, Button } from "@mui/material";
import { CommentToRecruit } from "./comment_to_recruit/CommentToRecruit";
import { useCallback, useEffect, useRef } from "react";
import { CommentFormProvider } from "./comment_form/CommentFormProvider";
import { CommentForm } from "./comment_form/CommentForm";
import { useFirebaseAuthContext } from "@/components/providers/FirebaseAuthProvider";
import { GetRecruitResponseSuccessBody } from "@/pages/api/recruits/[id]";
import { RefetchOptions, QueryObserverResult } from "@tanstack/react-query";
import Link from "next/link";
import { grey } from "@mui/material/colors";

type Props = {
  recruit: RecruitDetail;
  refetchRecruit: (
    options?: RefetchOptions | undefined
  ) => Promise<QueryObserverResult<GetRecruitResponseSuccessBody, Error>>;
};

export const CommentsToRecruit = (props: Props) => {
  const { recruit, refetchRecruit } = props;
  const { currentFbUser } = useFirebaseAuthContext();

  const commentBottomRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = useCallback(
    () => commentBottomRef.current?.scrollIntoView({ behavior: "smooth" }),
    []
  );

  // 初期表示にスクロール
  useEffect(() => {
    // これがないとページリロード時にコメントボックスまで自動スクロールされない
    if (typeof currentFbUser === "undefined") return;
    scrollToBottom();
  }, [scrollToBottom, currentFbUser]);

  return (
    <Box>
      {!currentFbUser && (
        <Link href="/auth/signup" style={{ textDecoration: "none" }} passHref>
          <Box sx={{ display: "flex" }}>
            <Button sx={{ marginLeft: "auto" }} variant="outlined" size="large">
              コメント追加
            </Button>
          </Box>
        </Link>
      )}
      <Box sx={{ marginBottom: "15px", color: grey[500], fontSize: "14px" }}>
        ※個人情報を含むやり取りはSNSのダイレクトメッセージで行ってください。
      </Box>
      {recruit.commentsToRecruit.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {recruit.commentsToRecruit.map((comment) => (
            <CommentToRecruit
              key={comment.id}
              commentToRecruit={comment}
              refetchRecruit={refetchRecruit}
            />
          ))}
        </Box>
      )}

      {/* コメントボックス */}
      {!!currentFbUser && (
        <Box sx={{ pt: "10px" }}>
          <CommentFormProvider>
            <CommentForm
              recruitId={recruit.id}
              scrollToBottom={scrollToBottom}
              refetchRecruit={refetchRecruit}
            />
          </CommentFormProvider>
        </Box>
      )}

      <Box ref={commentBottomRef} />
    </Box>
  );
};
