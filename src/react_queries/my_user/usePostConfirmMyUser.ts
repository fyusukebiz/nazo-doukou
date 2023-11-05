import { PostConfirmMyUserResponseSuccessBody } from "@/pages/api/my_user/confirm";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const postConfirmMyUserFn = async () => {
  const { data } = await axios.post<PostConfirmMyUserResponseSuccessBody>(
    "/api/my_user/confirm"
  );

  return data;
};

export const usePostConfirmMyUser = () => {
  const postConfirmMyUser = useMutation({
    mutationFn: () => postConfirmMyUserFn(),
  });

  return { postConfirmMyUser };
};
