import { GetRecruitsByAdminResponseSuccessBody } from "@/pages/api/admin/recruits";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type GetRecruitsByAdminRequest = {
  query: {
    page: number;
    onlyMine?: boolean;
    freeWord?: string;
    orderBy?: "createdAt" | "possibleDate";
  };
};

const getRecruitsByAdmin = async (req: GetRecruitsByAdminRequest) => {
  const { page } = req.query;

  const urlSearchParam = new URLSearchParams();
  urlSearchParam.set("page", page.toString());

  const { data } = await axios.get<GetRecruitsByAdminResponseSuccessBody>(
    `/api/admin/recruits?${urlSearchParam.toString()}`
  );

  return data;
};

export const useRecruitsQueryByAdmin = (req: GetRecruitsByAdminRequest) => {
  return useQuery({
    queryKey: ["getRecruitsByAdmin", req.query],
    queryFn: () => getRecruitsByAdmin(req),
    // enabled: !req.query.freeWord || req.query.freeWord.length !== 1, // TODO:
  });
};
