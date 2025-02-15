import { BuyTransaction } from "@/server/db/schema/buyTransactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addBuyTransaction,
  deleteBuyTransaction,
} from "../actions/buyTxActions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const useAddBuyTransaction = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: BuyTransaction) => addBuyTransaction(data),
    onSuccess: async (res) => {
      if (res?.success) {
        toast.success(res.success);
        queryClient.invalidateQueries({ queryKey: ["buy-transactions"] });
        router.push("/transactions/buy");
      }
      if (res?.error) {
        toast.error(res.error);
      }
    },
    onError: (res) => {
      const err = res.message;
      toast.error(err);
      toast.success("Could not add Buy Transaction");
    },
  });
};

export const useDeleteBuyTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      transactionId,
    }: {
      userId: string;
      transactionId: string;
    }) => deleteBuyTransaction({ userId, transactionId }),
    onSuccess: async (res) => {
      if (res?.success) {
        toast.success(res.success);
        queryClient.invalidateQueries({ queryKey: ["buy-transactions"] });
      }
      if (res?.error) {
        toast.error(res.error);
      }
    },
    onError: (res) => {
      const err = res.message;
      toast.error(err);
      toast.success("Could not delete Buy Transaction");
    },
  });
};
