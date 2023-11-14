import { GetStrongAreasResponseSuccessBody } from "@/pages/api/strong_areas";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const getStrongAreas = async () => {
  const { data } = await axios.get<GetStrongAreasResponseSuccessBody>(
    `/api/strong_areas`
  );
  return data;
};

export const useStrongAreasQuery = () => {
  return useQuery({
    queryKey: ["getStrongAreas"],
    queryFn: () => getStrongAreas(),
  });
};
