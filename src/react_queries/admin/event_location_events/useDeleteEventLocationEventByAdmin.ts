import { DeleteEventLocationEventByAdminResponseBody } from "@/pages/api/admin/event_location_events/[id]";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type DeleteEventLocationEventByAdminRequest = {
  path: {
    eventLocationEventId: string;
  };
};

const deleteEventLocationEventByAdminFn = async (
  req: DeleteEventLocationEventByAdminRequest
) => {
  const { data } =
    await axios.delete<DeleteEventLocationEventByAdminResponseBody>(
      `/api/admin/event_location_events/${req.path.eventLocationEventId}`
    );
  return data;
};

export const useDeleteEventLocationEventByAdmin = () => {
  const deleteEventLocationEventByAdmin = useMutation({
    mutationFn: (req: DeleteEventLocationEventByAdminRequest) =>
      deleteEventLocationEventByAdminFn(req),
  });

  return { deleteEventLocationEventByAdmin };
};
