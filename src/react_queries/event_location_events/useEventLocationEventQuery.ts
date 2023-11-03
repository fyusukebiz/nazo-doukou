import { GetEventLocationEventResponseSuccessBody } from "@/pages/api/event_location_events/[id]";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type GetEventLocationEventRequest = {
  path: {
    eventLocationEventId: string;
  };
};

const getEventLocationEvent = async (req: GetEventLocationEventRequest) => {
  const { data } = await axios.get<GetEventLocationEventResponseSuccessBody>(
    `/api/event_location_events/${req.path.eventLocationEventId}`
  );
  return data;
};

export const useEventLocationEventQuery = (
  req: GetEventLocationEventRequest
) => {
  return useQuery({
    queryKey: ["getEventLocationEvent", req.path.eventLocationEventId],
    queryFn: () => getEventLocationEvent(req),
    enabled: !!req.path.eventLocationEventId,
  });
};
