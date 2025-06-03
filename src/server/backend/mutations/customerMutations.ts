import { NewCustomerSchema } from "@/lib/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { addCustomer, deleteCustomer } from "../actions/customerActions";

export const useAddCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      formData,
      customerId,
      userId,
    }: {
      formData: z.infer<typeof NewCustomerSchema>;
      customerId: string | undefined;
      userId: string;
      // supplierId: string;
    }) => addCustomer({ formData, customerId, userId }),
    onSuccess: async (res) => {
      if (res?.success) {
        toast.success(res.success);
        queryClient.invalidateQueries({ queryKey: ["customers"] });
        // queryClient.invalidateQueries({ queryKey: ["supplier-by-id"] });
      }
      if (res?.error) {
        toast.error(res.error);
      }
    },
    onError: (res) => {
      const err = res.message;
      toast.error(err);
      toast.success("Could not register/update New Customer");
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => deleteCustomer(id),
    onSuccess: async (res) => {
      if (res?.success) {
        toast.success(res.success);
        queryClient.invalidateQueries({ queryKey: ["customers"] });
      }
      if (res?.error) {
        toast.error(res.error);
      }
    },
    onError: (res) => {
      const err = res.message;
      toast.error(err);
      toast.success("Could not delete Customer");
    },
  });
};
