import {
  PatchEventLocationByAdminRequestBody,
  PatchEventLocationByAdminResponseSuccessBody,
} from "@/pages/api/admin/event_locations/[id]";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type PatchEventLocationByAdminRequest = {
  path: { eventLocationId: string };
  body: PatchEventLocationByAdminRequestBody;
};

const patchEventLocationFn = async (req: PatchEventLocationByAdminRequest) => {
  const { data } =
    await axios.patch<PatchEventLocationByAdminResponseSuccessBody>(
      `/api/admin/event_locations/${req.path.eventLocationId}`,
      req.body
    );

  return data;
};

export const usePatchEventLocation = () => {
  const patchEventLocation = useMutation({
    mutationFn: (req: PatchEventLocationByAdminRequest) =>
      patchEventLocationFn(req),
  });

  return { patchEventLocation };
};
