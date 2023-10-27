import { DeleteRecruitResponseBody } from "@/pages/api/recruits/[id]";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type DeleteRecruitRequest = {
  path: {
    recruitId: string;
  };
};

const deleteRecruitFn = async (req: DeleteRecruitRequest) => {
  const { data } = await axios.delete<DeleteRecruitResponseBody>(
    `/api/comments_to_recruit/${req.path.recruitId}`
  );
  return data;
};

export const useDeleteRecruit = () => {
  const deleteRecruit = useMutation({
    mutationFn: (req: DeleteRecruitRequest) => deleteRecruitFn(req),
  });

  return { deleteRecruit };
};
