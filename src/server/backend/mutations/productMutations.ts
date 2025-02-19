import { NewProductSchema } from "@/lib/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { addProduct, deleteProduct } from "../actions/productActions";
import { useRouter } from "next/navigation";

export const useAddProduct = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      data,
      productId,
      userId,
    }: {
      data: z.infer<typeof NewProductSchema> & {
        supplierId: string;
        unitId: string;
      };
      productId?: string;
      userId: string;
    }) => addProduct({ data, productId, userId }),
    onSuccess: async (res) => {
      if (res?.success) {
        toast.success(res.success);
        queryClient.invalidateQueries({ queryKey: ["products"] });
        // router.push("/products");
        router.push(`/products?productId=${res.data}`);
      }
      if (res?.error) {
        toast.error(res.error);
      }
    },
    onError: (res) => {
      const err = res.message;
      toast.error(err);
      toast.success("Could not add/update Product");
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      userId,
    }: {
      productId: string;
      userId: string;
    }) => deleteProduct({ productId, userId }),
    onSuccess: async (res) => {
      if (res?.success) {
        toast.success(res.success);
        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({
          queryKey: ["products-by-supplier-pagination"],
        });
      }
      if (res?.error) {
        toast.error(res.error);
      }
    },
    onError: (res) => {
      const err = res.message;
      toast.error(err);
      toast.success("Could not delete Product");
    },
  });
};
