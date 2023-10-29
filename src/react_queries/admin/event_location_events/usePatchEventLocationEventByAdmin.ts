import {
  PatchEventLocationEventByAdminRequestBody,
  PatchEventLocationEventByAdminResponseSuccessBody,
} from "@/pages/api/admin/event_location_events/[id]";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type PatchEventLocationEventByAdminRequest = {
  path: { eventLocationEventId: string };
  body: PatchEventLocationEventByAdminRequestBody;
};

const patchEventLocationEventFn = async (
  req: PatchEventLocationEventByAdminRequest
) => {
  const { data } =
    await axios.patch<PatchEventLocationEventByAdminResponseSuccessBody>(
      `/api/admin/event_location_events/${req.path.eventLocationEventId}`,
      req.body
    );

  return data;
};

export const usePatchEventLocationEvent = () => {
  const patchEventLocationEvent = useMutation({
    mutationFn: (req: PatchEventLocationEventByAdminRequest) =>
      patchEventLocationEventFn(req),
  });

  return { patchEventLocationEvent };
};
