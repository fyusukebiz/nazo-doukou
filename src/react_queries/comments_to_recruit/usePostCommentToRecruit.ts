import {
  PostCommentToRecruitRequestBody,
  PostCommentToRecruitResponseSuccessBody,
} from "@/pages/api/comments_to_recruit";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type PostCommentToRecruitRequest = {
  body: PostCommentToRecruitRequestBody;
};

const postCommentToRecruitFn = async (req: PostCommentToRecruitRequest) => {
  const { data } = await axios.post<PostCommentToRecruitResponseSuccessBody>(
    `/api/comments_to_recruit`, // TODO: /api/recruit/{recruitId}/commentsの方がベター
    req.body
  );

  return data;
};

export const usePostCommentToRecruit = () => {
  const postCommentToRecruit = useMutation({
    mutationFn: (req: PostCommentToRecruitRequest) =>
      postCommentToRecruitFn(req),
  });

  return { postCommentToRecruit };
};
