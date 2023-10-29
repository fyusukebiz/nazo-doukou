import {
  PatchEventByAdminRequestBody,
  PatchEventByAdminResponseSuccessBody,
} from "@/pages/api/admin/events/[id]";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type PatchEventByAdminRequest = {
  path: { eventId: string };
  body: PatchEventByAdminRequestBody;
};

const patchEventByAdminFn = async (req: PatchEventByAdminRequest) => {
  const { data } = await axios.patch<PatchEventByAdminResponseSuccessBody>(
    `/api/admin/events/${req.path.eventId}`,
    req.body
  );

  return data;
};

export const usePatchEventByAdmin = () => {
  const patchEventByAdmin = useMutation({
    mutationFn: (req: PatchEventByAdminRequest) => patchEventByAdminFn(req),
  });

  return { patchEventByAdmin };
};
