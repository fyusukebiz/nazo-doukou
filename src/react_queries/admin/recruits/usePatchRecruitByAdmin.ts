import {
  PatchRecruitByAdminRequestBody,
  PatchRecruitByAdminResponseSuccessBody,
} from "@/pages/api/admin/recruits/[id]";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type PatchRecruitByAdminRequest = {
  path: { recruitId: string };
  body: PatchRecruitByAdminRequestBody;
};

const patchRecruitByAdminFn = async (req: PatchRecruitByAdminRequest) => {
  const { data } = await axios.patch<PatchRecruitByAdminResponseSuccessBody>(
    `/api/admin/recruits/${req.path.recruitId}`,
    req.body
  );

  return data;
};

export const usePatchRecruitByAdmin = () => {
  const patchRecruitByAdmin = useMutation({
    mutationFn: (req: PatchRecruitByAdminRequest) => patchRecruitByAdminFn(req),
  });

  return { patchRecruitByAdmin };
};
