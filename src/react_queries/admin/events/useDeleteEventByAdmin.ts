import { DeleteEventByAdminResponseSuccessBody } from "@/pages/api/admin/events/[id]";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type DeleteEventByAdminRequest = {
  path: {
    eventId: string;
  };
};

const deleteEventByAdminFn = async (req: DeleteEventByAdminRequest) => {
  const { data } = await axios.delete<DeleteEventByAdminResponseSuccessBody>(
    `/api/admin/events/${req.path.eventId}`
  );
  return data;
};

export const useDeleteEventByAdmin = () => {
  const deleteEventByAdmin = useMutation({
    mutationFn: (req: DeleteEventByAdminRequest) => deleteEventByAdminFn(req),
  });

  return { deleteEventByAdmin };
};
