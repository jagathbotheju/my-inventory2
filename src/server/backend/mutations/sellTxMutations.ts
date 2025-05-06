import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  SellTransaction,
  SellTransactionExit,
} from "@/server/db/schema/sellTransactions";
import {
  addSellTransaction,
  deleteSellTransaction,
} from "../actions/sellTxActions";

export const useAddSellTransaction = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      data,
      supplierId,
    }: {
      data: SellTransaction;
      supplierId: string;
    }) => addSellTransaction({ data, supplierId }),
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
      toast.success("Could not add Sell Transaction");
    },
  });
};

export const useAddSellTransactions = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      userId,
      customerId,
      supplierId,
      data,
    }: {
      userId: string;
      customerId: string;
      supplierId: string;
      data: SellTransaction;
    }) => {
      return addSellTransaction({ data, supplierId });
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
      toast.success("Could not add Sell Transaction");
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
      sellTx: SellTransactionExit;
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
