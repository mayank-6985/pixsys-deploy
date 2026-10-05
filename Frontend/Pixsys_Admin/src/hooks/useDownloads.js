import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAllDownloads,
  updateDownload,
  deleteDownload,
  createDownload,
  createResource,
  updateResource,
  deleteResource,
} from "../Services/downloads";

const useInvalidateAll = () => {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["adminDownloads"] });
    qc.invalidateQueries({ queryKey: ["adminProducts"] });
    qc.invalidateQueries({ queryKey: ["categoryDetails"] });
    qc.invalidateQueries({ queryKey: ["productDetail"] });
  };
};

export const useAllDownloads = () => {
  return useQuery({
    queryKey: ["adminDownloads"],
    queryFn: fetchAllDownloads,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateDownload = () => {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: updateDownload,
    onSuccess: invalidate,
  });
};

export const useDeleteDownload = () => {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: deleteDownload,
    onSuccess: invalidate,
  });
};

export const useCreateDownload = () => {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: createDownload,
    onSuccess: invalidate,
  });
};

export const useCreateResource = () => {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: createResource,
    onSuccess: invalidate,
  });
};

export const useUpdateResource = () => {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: updateResource,
    onSuccess: invalidate,
  });
};

export const useDeleteResource = () => {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: deleteResource,
    onSuccess: invalidate,
  });
};
