import { GetPrefecturesResponseBody } from "@/pages/api/prefectures";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const getPrefectures = async () => {
  const { data } = await axios.get<GetPrefecturesResponseBody>(
    `/api/prefectures`
  );
  return data;
};

export const usePrefecturesQuery = () => {
  return useQuery({
    queryKey: ["getPrefectures"],
    queryFn: () => getPrefectures(),
  });
};
