import { GetMyUserResponseSuccessBody } from "@/pages/api/my_user";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const getMyUser = async () => {
  const { data } = await axios.get<GetMyUserResponseSuccessBody>(
    "/api/my_user"
  );
  return data;
};

export const useMyUserQuery = () => {
  return useQuery({
    queryKey: ["getMyUser"],
    queryFn: () => getMyUser(),
  });
};
