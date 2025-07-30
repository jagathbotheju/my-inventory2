import {
  BuyTransaction,
  BuyTransactionExt,
} from "@/server/db/schema/buyTransactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addBuyTransaction,
  addBuyTransactions,
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

export const useAddBuyTransactions = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      buyTxData,
      chequeData,
    }: {
      buyTxData: BuyTransaction[];
      chequeData:
        | {
            chequeNumber?: string | undefined;
            chequeDate?: Date | undefined;
            bankName?: string | undefined;
            amount?: number | undefined;
          }[]
        | undefined;
    }) => {
      return addBuyTransactions({ buyTxData, chequeData });
    },
    onSuccess: async (res) => {
      if (res?.success) {
        toast.success(res.success);
        queryClient.invalidateQueries({ queryKey: ["buy-transactions"] });
        queryClient.invalidateQueries({ queryKey: ["buy-tx-due-cheques"] });
        router.push("/transactions/buy");
      }
      if (res?.error) {
        toast.error(res.error);
      }
    },
    onError: (error) => {
      console.log("error", error);
      toast.error("Could not Add Transaction");
    },
  });
};

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
