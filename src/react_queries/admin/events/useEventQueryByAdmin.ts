import { GetEventByAdminResponseSuccessBody } from "@/pages/api/admin/events/[id]";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type GetEventByAdminRequest = {
  path: {
    eventId: string;
  };
};

const getEventByAdmin = async (req: GetEventByAdminRequest) => {
  const { data } = await axios.get<GetEventByAdminResponseSuccessBody>(
    `/api/admin/events/${req.path.eventId}`
  );
  return data;
};

export const useEventQueryByAdmin = (req: GetEventByAdminRequest) => {
  return useQuery({
    queryKey: ["getEventByAdmin", req.path.eventId],
    queryFn: () => getEventByAdmin(req),
    enabled: !!req.path.eventId,
  });
};
