import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type PatchMyUserRequest = {
  body: {
    user: {
      lastName: string;
      firstName: string;
      lastNameKana: string;
      firstNameKana: string;
    };
  };
};

type PatchMyUserResponse = "";

const patchMyUserFn = async (req: PatchMyUserRequest) => {
  const { data } = await axios.patch<PatchMyUserResponse>(
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
