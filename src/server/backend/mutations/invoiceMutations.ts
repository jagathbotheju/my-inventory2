import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addPayment } from "../actions/invoiceActions";
import { toast } from "sonner";

export const useAddPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      invoiceId,
      paymentMode,
      cashAmount,
      chequeData,
    }: {
      invoiceId: string;
      paymentMode: string;
      cashAmount: number;
      chequeData?:
        | {
            chequeNumber?: string | undefined;
            chequeDate?: Date | undefined;
            bankName?: string | undefined;
            amount?: number | undefined;
          }
        | undefined;
    }) =>
      addPayment({
        invoiceId,
        paymentMode,
        cashAmount,
        chequeData,
      }),
    onSuccess: async (res) => {
      if (res?.success) {
        toast.success(res.success);
        queryClient.invalidateQueries({
          queryKey: ["tell-tx-invoices-for-period"],
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
