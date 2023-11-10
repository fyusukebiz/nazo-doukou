import { GetRecruitResponseSuccessBody } from "@/pages/api/recruits/[id]";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type GetRecruitRequest = {
  path: { recruitId: string };
};

const getRecruit = async (req: GetRecruitRequest) => {
  const { data } = await axios.get<GetRecruitResponseSuccessBody>(
    `/api/recruits/${req.path.recruitId}`
  );
  return data;
};

export const useRecruitQuery = (req: GetRecruitRequest) => {
  return useQuery({
    queryKey: ["getRecruit", req.path.recruitId],
    queryFn: () => getRecruit(req),
    enabled: !!req.path.recruitId,
  });
};
