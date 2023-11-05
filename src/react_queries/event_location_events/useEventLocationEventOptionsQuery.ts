import { GetEventLocationEventOptionsResponseSuccessBody } from "@/pages/api/event_location_event_options";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const getEventLocationEventOptions = async () => {
  const { data } =
    await axios.get<GetEventLocationEventOptionsResponseSuccessBody>(
      `/api/event_location_event_options`
    );
  return data;
};

export const useEventLocationEventOptionsQuery = () => {
  return useQuery({
    queryKey: ["getEventLocationEventOptions"],
    queryFn: () => getEventLocationEventOptions(),
  });
};
