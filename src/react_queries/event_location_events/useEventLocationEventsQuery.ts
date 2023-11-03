import { GetEventLocationEventsResponseSuccessBody } from "@/pages/api/event_location_events";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type GetEventLocationEventsRequest = {
  query: {
    page: number;
  };
};

const getEventLocationEvents = async (req: GetEventLocationEventsRequest) => {
  const { data } = await axios.get<GetEventLocationEventsResponseSuccessBody>(
    `/api/event_location_events?page=${req.query.page}`
  );
  return data;
};

export const useEventLocationEventsQuery = (
  req: GetEventLocationEventsRequest
) => {
  return useQuery({
    queryKey: ["getEventLocationEvents", req.query],
    queryFn: () => getEventLocationEvents(req),
  });
};
