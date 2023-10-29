import {
  PatchRecruitRequestBody,
  PatchRecruitResponseSuccessBody,
} from "@/pages/api/recruits/[id]";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type PatchRecruitRequest = {
  path: { recruitId: string };
  body: PatchRecruitRequestBody;
};

const patchRecruitFn = async (req: PatchRecruitRequest) => {
  const { data } = await axios.patch<PatchRecruitResponseSuccessBody>(
    `/api/recruits/${req.path.recruitId}`,
    req.body
  );

  return data;
};

export const usePatchRecruit = () => {
  const patchRecruit = useMutation({
    mutationFn: (req: PatchRecruitRequest) => patchRecruitFn(req),
  });

  return { patchRecruit };
};
