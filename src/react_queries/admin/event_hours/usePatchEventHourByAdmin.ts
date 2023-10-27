import {
  PatchEventHourByAdminRequestBody,
  PatchEventHourByAdminResponseBody,
} from "@/pages/api/admin/event_hours/[id]";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type PatchEventHourByAdminRequest = {
  path: { eventHourId: string };
  body: PatchEventHourByAdminRequestBody;
};

const patchEventHourByAdminFn = async (req: PatchEventHourByAdminRequest) => {
  const { data } = await axios.patch<PatchEventHourByAdminResponseBody>(
    `/api/admin/event_hours/${req.path.eventHourId}`,
    req.body
  );

  return data;
};

export const usePatchEventHourByAdmin = () => {
  const patchEventHourByAdmin = useMutation({
    mutationFn: (req: PatchEventHourByAdminRequest) =>
      patchEventHourByAdminFn(req),
  });

  return { patchEventHourByAdmin };
};
