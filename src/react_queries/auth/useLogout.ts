import { LogoutResponseSuccessBody } from "@/pages/api/auth/logout";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const logout = async () => {
  const { data } = await axios.get<LogoutResponseSuccessBody>(
    "/api/auth/logout"
  );
  return data;
};

export const useLogout = () => {
  return useQuery({
    queryKey: ["logout"],
    queryFn: () => logout(),
    enabled: false,
  });
};
