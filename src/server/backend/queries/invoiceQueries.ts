import { useQuery } from "@tanstack/react-query";
import { getUserBuyTxInvoices } from "../actions/invoiceActions";

export const useUserBuyTxInvoices = (userId: string) => {
  return useQuery({
    queryKey: ["user-buy-invoices", userId],
    queryFn: () => getUserBuyTxInvoices(userId),
  });
};
