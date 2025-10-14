import { useQuery } from "@tanstack/react-query";
import {
  getDailySellTransactions,
  getSellTransactionsPagination,
  getSellTxByUserByPeriod,
  getSellTxByUserProduct,
  getSellTxCount,
  getSellTxDateRange,
  getSellTxTotalSales,
} from "../actions/sellTxActions";

export const useSellTxDateRange = ({
  userId,
  customerId,
  from,
  to,
}: {
  userId: string;
  customerId?: string;
  from: Date;
  to: Date;
}) => {
  return useQuery({
    queryKey: ["sell-tx-date-range", userId, from, to, customerId],
    queryFn: () => getSellTxDateRange({ userId, from, to, customerId }),
    enabled: from < to,
  });
};

export const useDailySellTransactions = ({
  sellDate,
  userId,
}: {
  sellDate: string;
  userId: string;
}) => {
  return useQuery({
    queryKey: ["daily-sell-transactions", sellDate, userId],
    queryFn: () => getDailySellTransactions({ userId, sellDate }),
  });
};

export const useSellTransactionsPagination = ({
  userId,
  period,
  timeFrame,
  page,
  searchTerm,
}: {
  userId: string;
  period: Period;
  timeFrame: TimeFrame;
  page: number;
  searchTerm: string;
}) => {
  return useQuery({
    queryKey: [
      "sell-transactions",
      userId,
      period,
      timeFrame,
      page,
      searchTerm,
    ],
    queryFn: () =>
      getSellTransactionsPagination({
        userId,
        period,
        timeFrame,
        page,
        searchTerm,
      }),
    // enabled: !!searchTerm?.length,
  });
};

//---sellTx-total-sales---
export const useSellTxTotalSales = ({
  userId,
  period,
  timeFrame,
  searchTerm,
}: {
  userId: string;
  period: Period;
  timeFrame: TimeFrame;
  searchTerm?: string;
}) => {
  return useQuery({
    queryKey: ["sell-transactions", userId, period, timeFrame],
    queryFn: () => getSellTxTotalSales({ userId, period, timeFrame }),
    enabled: !!!searchTerm,
  });
};

export const useSellTxCount = ({
  userId,
  period,
  timeFrame,
}: {
  userId: string;
  period: Period;
  timeFrame: TimeFrame;
}) => {
  return useQuery({
    queryKey: ["sell-tx-count", userId, period, timeFrame],
    queryFn: () => getSellTxCount({ userId, period, timeFrame }),
  });
};

//---SellTx-User-Product---
export const useSellTxByUserProduct = ({
  userId,
  productId,
}: {
  userId: string;
  productId: string;
}) => {
  return useQuery({
    queryKey: ["sell-tx-by-user-product", userId, productId],
    queryFn: () => getSellTxByUserProduct({ userId, productId }),
  });
};

export const useSellTxByUserByPeriod = ({
  userId,
  period,
  timeFrame,
}: {
  userId: string;
  period: Period;
  timeFrame: TimeFrame;
}) => {
  return useQuery({
    queryKey: ["sell-tx-user-period", userId, period, timeFrame],
    queryFn: () => getSellTxByUserByPeriod({ userId, period, timeFrame }),
  });
};
