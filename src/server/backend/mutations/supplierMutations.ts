import { NewSupplierSchema } from "@/lib/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { addSupplier, deleteSupplier } from "../actions/supplierActions";
import { toast } from "sonner";

export const useAddSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      formData,
      supplierId,
      userId,
    }: {
      formData: z.infer<typeof NewSupplierSchema>;
      supplierId: string | undefined;
      userId: string;
    }) => addSupplier({ formData, supplierId, userId }),
    onSuccess: async (res) => {
      if (res?.success) {
        toast.success(res.success);
        queryClient.invalidateQueries({ queryKey: ["suppliers"] });
        queryClient.invalidateQueries({ queryKey: ["supplier-by-id"] });
      }
      if (res?.error) {
        toast.error(res.error);
      }
    },
    onError: (res) => {
      const err = res.message;
      toast.error(err);
      toast.success("Could not register/update New Supplier");
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      supplierId,
      userId,
    }: {
      supplierId: string;
      userId: string;
    }) => deleteSupplier({ supplierId, userId }),
    onSuccess: async (res) => {
      if (res?.success) {
        toast.success(res.success);
        queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      }
      if (res?.error) {
        toast.error(res.error);
      }
    },
    onError: (res) => {
      const err = res.message;
      toast.error(err);
      toast.success("Could not delete Supplier");
    },
  });
};
