import { GetUploadSignedUrlsResponseSuccessBody } from "@/pages/api/upload_signed_urls";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const getUploadSignedUrls = async () => {
  const { data } = await axios.get<GetUploadSignedUrlsResponseSuccessBody>(
    `/api/upload_signed_urls`
  );
  return data;
};

export const useUploadSignedUrlsQuery = () => {
  return useQuery({
    queryKey: ["getUploadSignedUrls"],
    queryFn: () => getUploadSignedUrls(),
    enabled: false,
  });
};
