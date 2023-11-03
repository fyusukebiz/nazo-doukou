import { GetRecruitTagsResponseSuccessBody } from "@/pages/api/recruit_tags";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const getRecruitTags = async () => {
  const { data } = await axios.get<GetRecruitTagsResponseSuccessBody>(
    `/api/recruit_tags`
  );
  return data;
};

export const useRecruitTagsQuery = () => {
  return useQuery({
    queryKey: ["getRecruitTags"],
    queryFn: () => getRecruitTags(),
  });
};
