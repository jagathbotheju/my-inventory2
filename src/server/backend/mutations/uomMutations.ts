import { NewUomSchema } from "@/lib/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { addUom, deleteUom } from "../actions/umoActions";

export const useAddUom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: z.infer<typeof NewUomSchema>) =>
      addUom(formData),
    onSuccess: async (res) => {
      if (res?.success) {
        toast.success(res.success);
        queryClient.invalidateQueries({ queryKey: ["uoms"] });
        // queryClient.invalidateQueries({ queryKey: ["supplier-by-id"] });
      }
      if (res?.error) {
        toast.error(res.error);
      }
    },
    onError: (res) => {
      const err = res.message;
      toast.error(err);
      toast.success("Could not add/update UOM");
    },
  });
};

export const useDeleteUom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => deleteUom(id),
    onSuccess: async (res) => {
      if (res?.success) {
        toast.success(res.success);
        queryClient.invalidateQueries({ queryKey: ["uoms"] });
      }
      if (res?.error) {
        toast.error(res.error);
      }
    },
    onError: (res) => {
      const err = res.message;
      toast.error(err);
      toast.success("Could not delete UOM");
    },
  });
};
