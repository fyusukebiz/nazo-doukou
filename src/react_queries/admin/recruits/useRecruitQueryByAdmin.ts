import { GetRecruitByAdminResponseSuccessBody } from "@/pages/api/admin/recruits/[id]";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type GetRecruitByAdminRequest = {
  path: { recruitId: string };
};

const getRecruitByAdmin = async (req: GetRecruitByAdminRequest) => {
  const { data } = await axios.get<GetRecruitByAdminResponseSuccessBody>(
    `/api/admin/recruits/${req.path.recruitId}`
  );
  return data;
};

export const useRecruitQueryByAdmin = (req: GetRecruitByAdminRequest) => {
  return useQuery({
    queryKey: ["getRecruitByAdmin", req.path.recruitId],
    queryFn: () => getRecruitByAdmin(req),
    enabled: !!req.path.recruitId,
  });
};
