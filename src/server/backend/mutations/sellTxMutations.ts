import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SellTransactionExt } from "@/server/db/schema/sellTransactions";
import { deleteSellTransaction } from "../actions/sellTxActions";

export const useDeleteSellTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      sellTx,
    }: {
      userId: string;
      sellTx: SellTransactionExt;
    }) => deleteSellTransaction({ userId, sellTx }),
    onSuccess: async (res) => {
      if (res?.success) {
        toast.success(res.success);
        queryClient.invalidateQueries({ queryKey: ["sell-transactions"] });
      }
      if (res?.error) {
        toast.error(res.error);
      }
    },
    onError: (res) => {
      const err = res.message;
      toast.error(err);
      toast.success("Could not delete Transaction");
    },
  });
};
