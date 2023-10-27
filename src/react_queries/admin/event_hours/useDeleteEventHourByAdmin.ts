import { DeleteEventHourByAdminResponseBody } from "@/pages/api/admin/event_hours/[id]";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type DeleteEventHourByAdminRequest = {
  path: {
    eventHourId: string;
  };
};

const deleteEventHourByAdminFn = async (req: DeleteEventHourByAdminRequest) => {
  const { data } = await axios.delete<DeleteEventHourByAdminResponseBody>(
    `/api/admin/event_hours/${req.path.eventHourId}`
  );
  return data;
};

export const useDeleteEventHourByAdmin = () => {
  const deleteEventHourByAdmin = useMutation({
    mutationFn: (req: DeleteEventHourByAdminRequest) =>
      deleteEventHourByAdminFn(req),
  });

  return { deleteEventHourByAdmin };
};
