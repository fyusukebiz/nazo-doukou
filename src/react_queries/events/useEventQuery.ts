import { GetEventResponseSuccessBody } from "@/pages/api/events/[id]";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type GetEventRequest = {
  path: {
    eventId: string;
  };
};

const getEvent = async (req: GetEventRequest) => {
  const { data } = await axios.get<GetEventResponseSuccessBody>(
    `/api/events/${req.path.eventId}`
  );
  return data;
};

export const useEventQuery = (req: GetEventRequest) => {
  return useQuery({
    queryKey: ["getEvent", req.path.eventId],
    queryFn: () => getEvent(req),
  });
};
