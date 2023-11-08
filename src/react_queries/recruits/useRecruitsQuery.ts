import { GetRecruitsResponseSuccessBody } from "@/pages/api/recruits";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type GetRecruitsRequest = {
  query: {
    page: number;
    onlyMine?: boolean;
    freeWord?: string;
    orderBy?: "createdAt" | "possibleDate";
  };
};

const getRecruits = async (req: GetRecruitsRequest) => {
  const { page } = req.query;

  const urlSearchParam = new URLSearchParams();
  urlSearchParam.set("page", page.toString());
  if (req.query.onlyMine) urlSearchParam.set("only_mine", true.toString());
  if (req.query.freeWord) urlSearchParam.set("freeWord", req.query.freeWord);
  if (req.query.orderBy) urlSearchParam.set("orderBy", req.query.orderBy);

  const { data } = await axios.get<GetRecruitsResponseSuccessBody>(
    `/api/recruits?${urlSearchParam.toString()}`
  );

  return data;
};

export const useRecruitsQuery = (req: GetRecruitsRequest) => {
  return useQuery({
    queryKey: ["getRecruits", req.query],
    queryFn: () => getRecruits(req),
    // enabled: !req.query.freeWord || req.query.freeWord.length !== 1, // TODO:
  });
};
