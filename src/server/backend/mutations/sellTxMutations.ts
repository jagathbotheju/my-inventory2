import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  SellTransaction,
  SellTransactionExt,
} from "@/server/db/schema/sellTransactions";
import {
  addSellTransaction,
  addSellTransactions,
  deleteSellTransaction,
} from "../actions/sellTxActions";

export const useAddSellTransaction = () => {
  return useMutation({
    mutationFn: ({
      data,
      supplierId,
    }: {
      data: SellTransaction;
      supplierId: string;
    }) => addSellTransaction({ data, supplierId }),
  });
};

export const useAddSellTransactions = () => {
  return useMutation({
    mutationFn: ({
      sellTxData,
      chequeData,
    }: {
      sellTxData: SellTransaction;
      chequeData:
        | {
            chequeNumber?: string | undefined;
            chequeDate?: Date | undefined;
            bankName?: string | undefined;
            amount?: number | undefined;
          }[]
        | undefined;
    }) => {
      return addSellTransactions({ sellTxData, chequeData });
    },
  });
};

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
