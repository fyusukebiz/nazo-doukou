import {
  PatchMyUserRequestBody,
  PatchMyUserResponseSuccessBody,
} from "@/pages/api/my_user";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type PatchMyUserRequest = {
  body: PatchMyUserRequestBody;
};

const patchMyUserFn = async (req: PatchMyUserRequest) => {
  const { data } = await axios.patch<PatchMyUserResponseSuccessBody>(
    "/api/my_user",
    req.body
  );

  return data;
};

export const usePatchMyUser = () => {
  const patchMyUser = useMutation({
    mutationFn: (req: PatchMyUserRequest) => patchMyUserFn(req),
  });

  return { patchMyUser };
};
