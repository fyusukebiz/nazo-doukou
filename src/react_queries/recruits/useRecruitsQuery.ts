import { GetRecruitsResponseBody } from "@/pages/api/recruits";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type GetRecruitsRequest = {
  query: {
    page: number;
  };
};

const getRecruits = async (req: GetRecruitsRequest) => {
  const { page } = req.query;

  const urlSearchParam = new URLSearchParams();
  urlSearchParam.set("page", page.toString());

  const { data } = await axios.get<GetRecruitsResponseBody>(
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
