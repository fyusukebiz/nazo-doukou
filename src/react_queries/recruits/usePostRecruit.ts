import {
  PostRecruitRequestBody,
  PostRecruitResponseSuccessBody,
} from "@/pages/api/recruits";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type PostRecruitRequest = {
  body: PostRecruitRequestBody;
};

const postRecruitFn = async (req: PostRecruitRequest) => {
  const { data } = await axios.post<PostRecruitResponseSuccessBody>(
    `/api/recruits`,
    req.body
  );

  return data;
};

export const usePostRecruit = () => {
  const postRecruit = useMutation({
    mutationFn: (req: PostRecruitRequest) => postRecruitFn(req),
  });

  return { postRecruit };
};
