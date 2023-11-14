import {
  PostRecruitByAdminRequestBody,
  PostRecruitByAdminResponseSuccessBody,
} from "@/pages/api/admin/recruits";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type PostRecruitByAdminRequest = {
  body: PostRecruitByAdminRequestBody;
};

const postRecruitByAdminFn = async (req: PostRecruitByAdminRequest) => {
  const { data } = await axios.post<PostRecruitByAdminResponseSuccessBody>(
    `/api/admin/recruits`,
    req.body
  );

  return data;
};

export const usePostRecruitByAdmin = () => {
  const postRecruitByAdmin = useMutation({
    mutationFn: (req: PostRecruitByAdminRequest) => postRecruitByAdminFn(req),
  });

  return { postRecruitByAdmin };
};
