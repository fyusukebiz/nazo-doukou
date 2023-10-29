import { GetGameTypesResponseSuccessBody } from "@/pages/api/game_types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const getGameTypes = async () => {
  const { data } = await axios.get<GetGameTypesResponseSuccessBody>(
    `/api/game_types`
  );
  return data;
};

export const useGameTypesQuery = () => {
  return useQuery({
    queryKey: ["getGameTypes"],
    queryFn: () => getGameTypes(),
  });
};
