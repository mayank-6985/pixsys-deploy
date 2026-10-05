import { useQuery } from "@tanstack/react-query";
import { fetchLinks } from "../Services/MediaLink";

export const useLinks = () => {
  return useQuery({
    queryKey: ["links"],
    queryFn: fetchLinks,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};
