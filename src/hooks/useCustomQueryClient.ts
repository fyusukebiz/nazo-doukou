import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

export const useCustomQueryClient = () => {
  const router = useRouter();

  const handleOnError = (error: unknown) => {
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      if (status === 422) {
        const errors = error.response.data.errors as Record<string, string>;
        Object.entries(errors).forEach(([key, value]) => {
          toast.error(`${key}: ${value}`);
        });
      } else {
        toast.error(error.response.data.error);
      }

      if (error.response.data.redirectTo) {
        router.replace(error.response.data.redirectTo);
      }
    }
  };

  const customQueryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: handleOnError,
    }),
    mutationCache: new MutationCache({
      onError: handleOnError,
    }),
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        // staleTime: 0, // default: 0
      },
    },
  });

  return customQueryClient;
};
