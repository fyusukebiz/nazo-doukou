import { GetRecruitsResponseSuccessBody } from "@/pages/api/recruits";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type GetRecruitsRequest = {
  query: {
    page: number;
    onlyMine?: boolean;
  };
};

const getRecruits = async (req: GetRecruitsRequest) => {
  const { page } = req.query;

  const urlSearchParam = new URLSearchParams();
  urlSearchParam.set("page", page.toString());
  if (req.query.onlyMine) urlSearchParam.set("only_mine", true.toString());

  const { data } = await axios.get<GetRecruitsResponseSuccessBody>(
    `/api/recruits?${urlSearchParam.toString()}`
  );

  return data;
};

export const useRecruitsQuery = (req: GetRecruitsRequest) => {
  return useQuery({
    queryKey: ["getRecruits", req.query],
    queryFn: () => getRecruits(req),
  });
};
