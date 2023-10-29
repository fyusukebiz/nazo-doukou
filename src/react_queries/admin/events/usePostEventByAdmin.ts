import {
  PostEventByAdminRequestBody,
  PostEventByAdminResponseSuccessBody,
} from "@/pages/api/admin/events";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type PostEventByAdminRequest = {
  body: PostEventByAdminRequestBody;
};

const postEventByAdminFn = async (req: PostEventByAdminRequest) => {
  const { data } = await axios.post<PostEventByAdminResponseSuccessBody>(
    `/api/admin/events`,
    req.body
  );

  return data;
};

export const usePostEventByAdmin = () => {
  const postEventByAdmin = useMutation({
    mutationFn: (req: PostEventByAdminRequest) => postEventByAdminFn(req),
  });

  return { postEventByAdmin };
};
