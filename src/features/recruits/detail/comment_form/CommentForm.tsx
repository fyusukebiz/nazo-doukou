import { LoadingButton } from "@mui/lab";
import { Box } from "@mui/material";
import { useCallback } from "react";
import { SubmitHandler, useWatch } from "react-hook-form";
import {
  CommentFormSchema,
  useNewCommentFormContext,
} from "./CommentFormProvider";
import { usePostCommentToRecruit } from "@/react_queries/comments_to_recruit/usePostCommentToRecruit";
import { InputWithLabelRHF } from "@/components/forms/hook_form/InputWithLabelRHF";
import {
  QueryObserverResult,
  RefetchOptions,
  // useQueryClient,
} from "@tanstack/react-query";
import { useIsMobileContext } from "@/features/common/IsMobileProvider";
import { grey } from "@mui/material/colors";
import { toast } from "react-toastify";
import { GetRecruitResponseSuccessBody } from "@/pages/api/recruits/[id]";

type Props = {
  recruitId: string;
  scrollToBottom: () => void | undefined;
  refetchRecruit: (
    options?: RefetchOptions | undefined
  ) => Promise<QueryObserverResult<GetRecruitResponseSuccessBody, Error>>;
};

export const CommentForm = (props: Props) => {
  const { recruitId, refetchRecruit, scrollToBottom } = props;
  const { postCommentToRecruit } = usePostCommentToRecruit();
  const { handleSubmit, control, reset } = useNewCommentFormContext();
  const message = useWatch({ control, name: "message" });
  // const queryClient = useQueryClient();
  const { isMobile } = useIsMobileContext();

  const onSubmit: SubmitHandler<CommentFormSchema> = useCallback(
    (data) => {
      postCommentToRecruit.mutate(
        { body: { commentToRecruit: { recruitId, message: data.message } } },
        {
          onSuccess: async () => {
            reset({ message: "" });
            // TODO: なぜか動かない
            // queryClient.invalidateQueries({
            //   queryKey: ["getRecruit", recruitId],
            // });
            await refetchRecruit();
            setTimeout(scrollToBottom, 100);
            toast.success("投稿しました");
          },
        }
      );
    },
    [postCommentToRecruit, recruitId, refetchRecruit, reset, scrollToBottom]
  );

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "7px",
      }}
    >
      {/* コメント */}
      <InputWithLabelRHF<CommentFormSchema>
        name="message"
        control={control}
        autoComplete="off"
        size={isMobile ? "small" : "medium"}
        placeholder="メッセージを入力"
        sx={{
          boxSizing: "border-box",
          background: grey[100],
          marginX: "5px",
          flexGrow: 1,
        }}
        inputProps={{ style: { padding: "8.5px 14px" } }}
        disabled={postCommentToRecruit.isPending}
        multiline
        fullWidth
      />
      {/* ボタン */}
      {/*　投稿ボタン */}
      <LoadingButton
        type="submit"
        color="teal"
        sx={{ padding: "6px 0px", minWidth: "40px" }}
        disabled={!message}
        loading={postCommentToRecruit.isPending}
      >
        投稿
      </LoadingButton>
    </Box>
  );
};
