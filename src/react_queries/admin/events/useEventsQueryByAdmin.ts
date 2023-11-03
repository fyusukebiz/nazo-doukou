import { GetEventsByAdminResponseSuccessBody } from "@/pages/api/admin/events";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type GetEventsByAdminRequest = {
  query: {
    page: number;
  };
};

const getEventsByAdmin = async (req: GetEventsByAdminRequest) => {
  const { data } = await axios.get<GetEventsByAdminResponseSuccessBody>(
    `/api/admin/events?page=${req.query.page}`
  );
  return data;
};

export const useEventsQueryByAdmin = (req: GetEventsByAdminRequest) => {
  return useQuery({
    queryKey: ["getEventsByAdmin", req.query],
    queryFn: () => getEventsByAdmin(req),
  });
};
