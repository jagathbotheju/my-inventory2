import { BuyTransactionExt } from "@/server/db/schema/buyTransactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBuyTransaction } from "../actions/buyTxActions";
import { toast } from "sonner";

export const useDeleteBuyTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      buyTx,
    }: {
      userId: string;
      buyTx: BuyTransactionExt;
    }) => deleteBuyTransaction({ userId, buyTx }),
    onSuccess: async (res) => {
      if (res?.success) {
        toast.success(res.success);
        queryClient.invalidateQueries({ queryKey: ["buy-transactions"] });
        queryClient.invalidateQueries({
          queryKey: ["sell-tx-invoices-for-period"],
        });

        queryClient.invalidateQueries({
          queryKey: ["buy-tx-invoices-for-period"],
        });
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
