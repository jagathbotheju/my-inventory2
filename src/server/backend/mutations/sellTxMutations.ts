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
import { useRouter } from "next/navigation";

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
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      sellTxData,
      chequeData,
    }: {
      sellTxData: SellTransaction[];
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
    onSuccess: async (res) => {
      if (res?.success) {
        toast.success(res.success);
        queryClient.invalidateQueries({ queryKey: ["sell-transactions"] });
        router.push("/transactions/sell");
      }
      if (res?.error) {
        toast.error(res.error);
      }
    },
    onError: (res) => {
      const err = res.message;
      toast.error(err);
      toast.success("Could not Add Transaction");
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
