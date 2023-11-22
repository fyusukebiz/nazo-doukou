import { GetEventLocationsResponseSuccessBody } from "@/pages/api/event_locations";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export type EventLocationSearchQueryParams = {
  eventName?: string;
  locationIds?: string[];
  gameTypeIds?: string[];
  date?: Date;
};

type GetEventLocationsRequest = {
  query: {
    page: number;
    params: EventLocationSearchQueryParams;
  };
};

const getEventLocations = async (req: GetEventLocationsRequest) => {
  const { page = 1, params } = req.query;

  const urlSearchParam = new URLSearchParams();
  urlSearchParam.set("page", page.toString());
  if (params.eventName) urlSearchParam.set("eventName", params.eventName);
  if (params.locationIds && params.locationIds.length > 0)
    urlSearchParam.set("locationIds", params.locationIds.join(","));
  if (params.gameTypeIds && params.gameTypeIds.length > 0)
    urlSearchParam.set("gameTypeIds", params.gameTypeIds.join(","));
  if (params.date) urlSearchParam.set("date", params.date.toISOString());

  const { data } = await axios.get<GetEventLocationsResponseSuccessBody>(
    `/api/event_locations?${urlSearchParam.toString()}`
  );
  return data;
};

export const useEventLocationsQuery = (
  req: GetEventLocationsRequest,
  isInitialized: boolean
) => {
  return useQuery({
    queryKey: ["getEventLocations", req.query],
    queryFn: () => getEventLocations(req),
    enabled: isInitialized,
  });
};
