import { useQuery } from "@tanstack/react-query";
import {
  buyTxDueChecks,
  getBuyTxInvoicesForPeriod,
  getSellTxInvoicesForPeriod,
  searchBuyTxInvoices,
  searchSellTxInvoices,
} from "../actions/invoiceActions";

//search SellTx Invoices
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

//Search BuyTx Invoices
export const useSearchBuyTxInvoices = ({
  userId,
  searchTerm,
  isBuyTx,
}: {
  userId: string;
  searchTerm: string;
  isBuyTx: boolean;
}) => {
  return useQuery({
    queryKey: ["search-buy-txs", userId, searchTerm],
    queryFn: () => searchBuyTxInvoices({ userId, searchTerm }),
    enabled: searchTerm.length >= 3 && isBuyTx,
  });
};

//SellTx Invoices Period
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
    queryKey: ["sell-tx-invoices-for-period", userId, period, timeFrame],
    queryFn: () => getSellTxInvoicesForPeriod({ userId, period, timeFrame }),
    enabled: searchTerm.length === 0 && isSellTx,
  });
};

//BuyTx Invoices Period
export const useBuyTxInvoicesForPeriod = ({
  userId,
  period,
  timeFrame,
  isBuyTx,
  searchTerm,
}: {
  userId: string;
  period: Period;
  timeFrame: TimeFrame;
  isBuyTx: boolean;
  searchTerm: string;
}) => {
  return useQuery({
    queryKey: ["buy-tx-invoices-for-period", userId, period, timeFrame],
    queryFn: () => getBuyTxInvoicesForPeriod({ userId, period, timeFrame }),
    enabled: searchTerm.length === 0 && isBuyTx,
  });
};

export const useBuyTxDueCheques = (userId: string) => {
  return useQuery({
    queryKey: ["buy-tx-due-cheques", userId],
    queryFn: () => buyTxDueChecks(userId),
  });
};
