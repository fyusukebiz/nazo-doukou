import { GetEventLocationOptionsResponseSuccessBody } from "@/pages/api/event_location_options";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const getEventLocationOptions = async () => {
  const { data } = await axios.get<GetEventLocationOptionsResponseSuccessBody>(
    `/api/event_location_options`
  );
  return data;
};

export const useEventLocationOptionsQuery = () => {
  return useQuery({
    queryKey: ["getEventLocationOptions"],
    queryFn: () => getEventLocationOptions(),
  });
};
