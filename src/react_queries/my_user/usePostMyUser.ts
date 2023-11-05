import {
  PostMyUserRequestBody,
  PostMyUserResponseSuccessBody,
} from "@/pages/api/my_user";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type PostMyUserRequest = {
  body: PostMyUserRequestBody;
};

const postMyUserFn = async (req: PostMyUserRequest) => {
  const { data } = await axios.post<PostMyUserResponseSuccessBody>(
    "/api/my_user",
    req.body
  );

  return data;
};

export const usePostMyUser = () => {
  const postMyUser = useMutation({
    mutationFn: (req: PostMyUserRequest) => postMyUserFn(req),
  });

  return { postMyUser };
};
