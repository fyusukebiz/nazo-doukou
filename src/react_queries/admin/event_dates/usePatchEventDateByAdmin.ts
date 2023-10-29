import {
  PatchEventDateByAdminRequestBody,
  PatchEventDateByAdminResponseSuccessBody,
} from "@/pages/api/admin/event_dates/[id]";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type PatchEventDateByAdminRequest = {
  path: { eventDateId: string };
  body: PatchEventDateByAdminRequestBody;
};

const patchEventDateFn = async (req: PatchEventDateByAdminRequest) => {
  const { data } = await axios.patch<PatchEventDateByAdminResponseSuccessBody>(
    `/api/admin/event_dates/${req.path.eventDateId}`,
    req.body
  );

  return data;
};

export const usePatchEventDate = () => {
  const patchEventDate = useMutation({
    mutationFn: (req: PatchEventDateByAdminRequest) => patchEventDateFn(req),
  });

  return { patchEventDate };
};
