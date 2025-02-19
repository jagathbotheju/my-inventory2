import { useQuery } from "@tanstack/react-query";
import {
  getBuyTransactionsPagination,
  getBuyTxCount,
  getBuyTxYears,
  getByTxTotalPurchase,
  getDailyBuyTransactions,
} from "../actions/buyTxActions";

export const useDailyBuyTransactions = ({
  buyDate,
  userId,
}: {
  buyDate: string;
  userId: string;
}) => {
  return useQuery({
    queryKey: ["daily-buy-transactions", buyDate, userId],
    queryFn: () => getDailyBuyTransactions({ userId, buyDate }),
  });
};

export const useBuyTransactionsPagination = ({
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
    queryKey: ["buy-transactions", userId, period, timeFrame, page],
    queryFn: () =>
      getBuyTransactionsPagination({ userId, period, timeFrame, page }),
  });
};

export const useByTxTotalPurchase = ({
  userId,
  period,
  timeFrame,
}: {
  userId: string;
  period: Period;
  timeFrame: TimeFrame;
}) => {
  return useQuery({
    queryKey: ["buy-transactions", userId, period, timeFrame],
    queryFn: () => getByTxTotalPurchase({ userId, period, timeFrame }),
  });
};

export const useBuyTxYears = () => {
  return useQuery({
    queryKey: ["buy-tx-years"],
    queryFn: () => getBuyTxYears(),
  });
};

export const useBuyTxCount = ({
  userId,
  period,
  timeFrame,
}: {
  userId: string;
  period: Period;
  timeFrame: TimeFrame;
}) => {
  return useQuery({
    queryKey: ["buy-tx-count", userId, period, timeFrame],
    queryFn: () => getBuyTxCount({ userId, period, timeFrame }),
  });
};
