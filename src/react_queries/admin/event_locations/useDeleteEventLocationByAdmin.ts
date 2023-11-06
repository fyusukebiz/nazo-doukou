import { DeleteEventLocationByAdminResponseSuccessBody } from "@/pages/api/admin/event_locations/[id]";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type DeleteEventLocationByAdminRequest = {
  path: {
    eventLocationId: string;
  };
};

const deleteEventLocationByAdminFn = async (
  req: DeleteEventLocationByAdminRequest
) => {
  const { data } =
    await axios.delete<DeleteEventLocationByAdminResponseSuccessBody>(
      `/api/admin/event_locations/${req.path.eventLocationId}`
    );
  return data;
};

export const useDeleteEventLocationByAdmin = () => {
  const deleteEventLocationByAdmin = useMutation({
    mutationFn: (req: DeleteEventLocationByAdminRequest) =>
      deleteEventLocationByAdminFn(req),
  });

  return { deleteEventLocationByAdmin };
};
