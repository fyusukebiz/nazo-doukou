import { DeleteCommentToRecruitResponseSuccessBody } from "@/pages/api/comments_to_recruit/[id]";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type DeleteCommentToRecruitRequest = {
  path: {
    commentToRecruitId: string;
  };
};

const deleteCommentToRecruitFn = async (req: DeleteCommentToRecruitRequest) => {
  const { data } =
    await axios.delete<DeleteCommentToRecruitResponseSuccessBody>(
      `/api/comments_to_recruit/${req.path.commentToRecruitId}`
    );
  return data;
};

export const useDeleteCommentToRecruit = () => {
  const deleteCommentToRecruit = useMutation({
    mutationFn: (req: DeleteCommentToRecruitRequest) =>
      deleteCommentToRecruitFn(req),
  });

  return { deleteCommentToRecruit };
};
