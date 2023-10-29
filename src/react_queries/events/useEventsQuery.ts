import { GetEventsResponseSuccessBody } from "@/pages/api/events";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export type EventSearchQueryParams =
  | {
      year?: number;
      month?: number;
      eventLocationIds?: string[];
    }
  | undefined;

type GetEventsRequest = {
  query: {
    page: number;
    params?: EventSearchQueryParams;
  };
};

const getEvents = async (req: GetEventsRequest) => {
  const { page = 1, params } = req.query;

  const urlSearchParam = new URLSearchParams();
  urlSearchParam.set("page", page.toString());

  if (params) {
    if (params.year && params.month) {
      urlSearchParam.set("year", params.year.toString());
      urlSearchParam.set("month", params.month.toString());
    }
    if (params.eventLocationIds && params.eventLocationIds.length > 0) {
      urlSearchParam.set("eventLocationIds", params.eventLocationIds.join(","));
    }
  }

  const { data } = await axios.get<GetEventsResponseSuccessBody>(
    `/api/events?${urlSearchParam.toString()}`
  );
  return data;
};

export const useEventsQuery = (
  req: GetEventsRequest,
  isInitialized: boolean
) => {
  return useQuery({
    queryKey: ["getEvents", req.query],
    queryFn: () => getEvents(req),
    enabled: isInitialized,
  });
};
