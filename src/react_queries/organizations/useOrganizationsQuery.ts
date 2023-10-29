import { GetOrganizationsResponseSuccessBody } from "@/pages/api/organizations";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const getOrganizations = async () => {
  const { data } = await axios.get<GetOrganizationsResponseSuccessBody>(
    `/api/organizations`
  );
  return data;
};

export const useOrganizationsQuery = () => {
  return useQuery({
    queryKey: ["getOrganizations"],
    queryFn: () => getOrganizations(),
  });
};
