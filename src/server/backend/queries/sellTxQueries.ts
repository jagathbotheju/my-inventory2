import { useQuery } from "@tanstack/react-query";
import {
  getDailySellTransactions,
  getSellTransactionsPagination,
  getSellTxCount,
  getSellTxTotalSales,
} from "../actions/sellTxActions";

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
}: {
  userId: string;
  period: Period;
  timeFrame: TimeFrame;
  page: number;
}) => {
  return useQuery({
    queryKey: ["sell-transactions", userId, period, timeFrame, page],
    queryFn: () =>
      getSellTransactionsPagination({ userId, period, timeFrame, page }),
  });
};

export const useSellTxTotalSales = ({
  userId,
  period,
  timeFrame,
}: {
  userId: string;
  period: Period;
  timeFrame: TimeFrame;
}) => {
  return useQuery({
    queryKey: ["sell-transactions", userId, period, timeFrame],
    queryFn: () => getSellTxTotalSales({ userId, period, timeFrame }),
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
