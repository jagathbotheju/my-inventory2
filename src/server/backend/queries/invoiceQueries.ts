import { useQuery } from "@tanstack/react-query";
import {
  getSellTxInvoicesForPeriod,
  searchBuyTxInvoices,
  searchSellTxInvoices,
} from "../actions/invoiceActions";

export const useSearchSellTxInvoices = ({
  userId,
  searchTerm,
  isSellTx,
}: {
  userId: string;
  searchTerm: string;
  isSellTx: boolean;
}) => {
  return useQuery({
    queryKey: ["search-sell-txs", userId, searchTerm],
    queryFn: () => searchSellTxInvoices({ userId, searchTerm }),
    enabled: searchTerm.length >= 3 && isSellTx,
  });
};

export const useSearchBuyTxInvoices = ({
  userId,
  searchTerm,
  isSellTx,
}: {
  userId: string;
  searchTerm: string;
  isSellTx: boolean;
}) => {
  console.log("query isSellTx", isSellTx, "searchTerm", searchTerm);

  return useQuery({
    queryKey: ["search-buy-txs", userId, searchTerm],
    queryFn: () => searchBuyTxInvoices({ userId, searchTerm }),
    enabled: searchTerm.length >= 3 && !isSellTx,
  });
};

export const useSellTxInvoicesForPeriod = ({
  userId,
  period,
  timeFrame,
  isSellTx,
  searchTerm,
}: {
  userId: string;
  period: Period;
  timeFrame: TimeFrame;
  isSellTx: boolean;
  searchTerm: string;
}) => {
  return useQuery({
    queryKey: ["tell-tx-invoices-for-period", userId, period, timeFrame],
    queryFn: () => getSellTxInvoicesForPeriod({ userId, period, timeFrame }),
    enabled: searchTerm.length === 0 && isSellTx,
  });
};
