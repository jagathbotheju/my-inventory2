import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addBuyTxPayment, addSellTxPayment } from "../actions/invoiceActions";

export const useAddPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      invoiceId,
      paymentMode,
      cashAmount,
      creditAmount,
      chequeData,
      isBuyTx,
    }: {
      isBuyTx: boolean;
      invoiceId: string;
      paymentMode: string;
      cashAmount: number;
      creditAmount: number;
      chequeData?:
        | {
            chequeNumber?: string | undefined;
            chequeDate?: Date | undefined;
            bankName?: string | undefined;
            amount?: number | undefined;
          }[]
        | undefined;
    }) => {
      if (isBuyTx) {
        return addBuyTxPayment({
          invoiceId,
          paymentMode,
          cashAmount,
          creditAmount,
          chequeData,
        });
      } else {
        return addSellTxPayment({
          invoiceId,
          paymentMode,
          cashAmount,
          creditAmount,
          chequeData,
        });
      }
    },
    onSuccess: async (res) => {
      if (res?.success) {
        toast.success(res.success);
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
      toast.success("Could not Add Payment");
    },
  });
};
