import { DeleteRecruitByAdminResponseSuccessBody } from "@/pages/api/admin/recruits/[id]";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type DeleteRecruitByAdminRequest = {
  path: {
    recruitId: string;
  };
};

const deleteRecruitByAdminFn = async (req: DeleteRecruitByAdminRequest) => {
  const { data } = await axios.delete<DeleteRecruitByAdminResponseSuccessBody>(
    `/api/admin/recruits/${req.path.recruitId}`
  );
  return data;
};

export const useDeleteRecruitByAdmin = () => {
  const deleteRecruitByAdmin = useMutation({
    mutationFn: (req: DeleteRecruitByAdminRequest) =>
      deleteRecruitByAdminFn(req),
  });

  return { deleteRecruitByAdmin };
};
