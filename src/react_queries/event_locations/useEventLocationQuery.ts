import { GetEventLocationResponseSuccessBody } from "@/pages/api/event_locations/[id]";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type GetEventLocationRequest = {
  path: {
    eventLocationId: string;
  };
};

const getEventLocation = async (req: GetEventLocationRequest) => {
  const { data } = await axios.get<GetEventLocationResponseSuccessBody>(
    `/api/event_locations/${req.path.eventLocationId}`
  );
  return data;
};

export const useEventLocationQuery = (req: GetEventLocationRequest) => {
  return useQuery({
    queryKey: ["getEventLocation", req.path.eventLocationId],
    queryFn: () => getEventLocation(req),
    enabled: !!req.path.eventLocationId,
  });
};
