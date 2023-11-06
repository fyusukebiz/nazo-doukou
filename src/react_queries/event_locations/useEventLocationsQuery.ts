import { GetEventLocationsResponseSuccessBody } from "@/pages/api/event_locations";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type GetEventLocationsRequest = {
  query: {
    page: number;
  };
};

const getEventLocations = async (req: GetEventLocationsRequest) => {
  const { data } = await axios.get<GetEventLocationsResponseSuccessBody>(
    `/api/event_locations?page=${req.query.page}`
  );
  return data;
};

export const useEventLocationsQuery = (req: GetEventLocationsRequest) => {
  return useQuery({
    queryKey: ["getEventLocations", req.query],
    queryFn: () => getEventLocations(req),
  });
};
