import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  addBuyTxInvoice,
  addBuyTxPayment,
  addSellTxInvoice,
  addSellTxPayment,
} from "../actions/invoiceActions";
import { BuyProductsSchema, SellProductsSchema } from "@/lib/schema";
import { z } from "zod";
import { useRouter } from "next/navigation";

//==AddBuyTxInvoice
export const useAddByTxInvoice = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      formData,
      userId,
      supplierId,
      date,
    }: {
      formData: z.infer<typeof BuyProductsSchema>;
      userId: string;
      supplierId: string;
      date: string;
    }) => addBuyTxInvoice({ formData, userId, supplierId, date }),
    onSuccess: async (res) => {
      if (res?.success) {
        toast.success(res.success);
        router.push("/transactions/buy");
      }
      if (res?.error) {
        toast.error(res.error);
      }
    },
    onError: (res) => {
      const err = res.message;
      toast.error(err);
      toast.success("Could not Purchase");
    },
  });
};

//==AddSellTxInvoice
export const useAddSellTxInvoice = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      formData,
      userId,
      customerId,
      date,
    }: {
      formData: z.infer<typeof SellProductsSchema>;
      userId: string;
      customerId: string;
      date: string;
    }) => addSellTxInvoice({ formData, userId, customerId, date }),
    onSuccess: async (res) => {
      if (res?.success) {
        toast.success(res.success);
        router.push("/transactions/sell");
      }
      if (res?.error) {
        toast.error(res.error);
      }
    },
    onError: (res) => {
      const err = res.message;
      toast.error(err);
      toast.success("Product Sales Error");
    },
  });
};

//---add-payment---
export const useAddPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      date,
      invoiceId,
      paymentMode,
      cashAmount,
      creditAmount,
      chequeData,
      isBuyTx,
    }: {
      date: string;
      isBuyTx: boolean;
      invoiceId: string;
      paymentMode: string;
      cashAmount: number;
      creditAmount: number;
      chequeData?:
        | {
            chequeNumber?: string | undefined;
            chequeDate?: string | undefined;
            bankName?: string | undefined;
            amount?: number | undefined;
          }[]
        | undefined;
    }) => {
      if (isBuyTx) {
        return addBuyTxPayment({
          date,
          invoiceId,
          paymentMode,
          cashAmount,
          creditAmount,
          chequeData,
        });
      } else {
        return addSellTxPayment({
          date,
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
