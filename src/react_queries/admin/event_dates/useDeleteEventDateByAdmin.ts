import { DeleteEventDateByAdminResponseSuccessBody } from "@/pages/api/admin/event_dates/[id]";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type DeleteEventDateByAdminRequest = {
  path: {
    eventDateId: string;
  };
};

const deleteMyAccountAvatarByAdminFn = async (
  req: DeleteEventDateByAdminRequest
) => {
  const { data } =
    await axios.delete<DeleteEventDateByAdminResponseSuccessBody>(
      `/api/admin/event_dates/${req.path.eventDateId}`
    );
  return data;
};

export const useDeleteMyAccountAvatarByAdmin = () => {
  const deleteMyAccountAvatarByAdmin = useMutation({
    mutationFn: (req: DeleteEventDateByAdminRequest) =>
      deleteMyAccountAvatarByAdminFn(req),
  });

  return { deleteMyAccountAvatarByAdmin };
};
