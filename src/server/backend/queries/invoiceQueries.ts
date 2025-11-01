import { useQuery } from "@tanstack/react-query";
import {
  buyTxDueChecks,
  getBuyTxInvoicesCount,
  getBuyTxInvoicesForPeriodPagination,
  getSellTxInvoicesCount,
  getSellTxInvoicesForPeriodPagination,
  getBuyTxInvoice,
} from "../actions/invoiceActions";

//---BuyTxInvoices-Period-pagination---
export const useBuyTxInvoicesForPeriodPagination = ({
  userId,
  period,
  timeFrame,
  isBuyTx,
  page,
  searchTerm,
}: {
  userId: string;
  period: Period;
  timeFrame: TimeFrame;
  isBuyTx: boolean;
  searchTerm: string;
  page: number;
}) => {
  return useQuery({
    queryKey: [
      "buy-tx-invoices-for-period",
      userId,
      period,
      timeFrame,
      page,
      searchTerm,
    ],
    queryFn: () =>
      getBuyTxInvoicesForPeriodPagination({
        userId,
        period,
        timeFrame,
        page,
        searchTerm,
      }),
    enabled: searchTerm.length >= 3 || isBuyTx,
  });
};

//---SellTxInvoices-Period-pagination---
export const useSellTxInvoicesForPeriodPagination = ({
  userId,
  period,
  timeFrame,
  isBuyTx,
  page,
  searchTerm,
}: {
  userId: string;
  period: Period;
  timeFrame: TimeFrame;
  isBuyTx: boolean;
  searchTerm: string;
  page: number;
}) => {
  return useQuery({
    queryKey: [
      "sell-tx-invoices-for-period",
      userId,
      period,
      timeFrame,
      page,
      searchTerm,
    ],
    queryFn: () =>
      getSellTxInvoicesForPeriodPagination({
        userId,
        period,
        timeFrame,
        page,
        searchTerm,
      }),
    enabled: searchTerm.length >= 3 || !isBuyTx,
  });
};

//--buyTxInvoices-count---
export const useBuyTxInvoicesCount = ({
  userId,
  period,
  timeFrame,
  searchTerm,
}: {
  userId: string;
  period: Period;
  timeFrame: TimeFrame;
  searchTerm: string;
}) => {
  return useQuery({
    queryKey: ["buy-tx-invoices-count", userId, period, timeFrame],
    queryFn: () => getBuyTxInvoicesCount({ userId, period, timeFrame }),
    enabled: !!!searchTerm,
  });
};

//--sellTxInvoices-count---
export const useSellTxInvoicesCount = ({
  userId,
  period,
  timeFrame,
  searchTerm,
}: {
  userId: string;
  period: Period;
  timeFrame: TimeFrame;
  searchTerm: string;
}) => {
  return useQuery({
    queryKey: ["sell-tx-invoices-count", userId, period, timeFrame],
    queryFn: () => getSellTxInvoicesCount({ userId, period, timeFrame }),
    enabled: !!!searchTerm,
  });
};

export const useBuyTxDueCheques = (userId: string) => {
  return useQuery({
    queryKey: ["buy-tx-due-cheques", userId],
    queryFn: () => buyTxDueChecks(userId),
  });
};

//---get-BuyTxInvoice

export const useBuyTxInvoice = (invoiceId: string) => {
  return useQuery({
    queryKey: ["buy-tx-invoice", invoiceId],
    queryFn: () => getBuyTxInvoice(invoiceId),
  });
};
