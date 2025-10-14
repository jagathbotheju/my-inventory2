import { useQuery } from "@tanstack/react-query";
import {
  getBuyTransactionsPagination,
  getBuyTxByUser,
  getBuyTxByUserByPeriod,
  getBuyTxByUserProduct,
  getBuyTxCount,
  getBuyTxTotalPurchase,
  getBuyTxYears,
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

//--buyTransactions-pagination---
export const useBuyTransactionsPagination = ({
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
    queryKey: ["buy-transactions", userId, period, timeFrame, page, searchTerm],
    queryFn: () =>
      getBuyTransactionsPagination({
        userId,
        period,
        timeFrame,
        page,
        searchTerm,
      }),
    // enabled: searchTerm?.length > 3,
  });
};

//---buyTx-total-purchases---
export const useByTxTotalPurchase = ({
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
    queryKey: ["buy-transactions", userId, period, timeFrame],
    queryFn: () => getBuyTxTotalPurchase({ userId, period, timeFrame }),
    enabled: !!!searchTerm,
  });
};

export const useBuyTxYears = () => {
  return useQuery({
    queryKey: ["buy-tx-years"],
    queryFn: () => getBuyTxYears(),
  });
};

//--buyTransactions-count---
export const useBuyTxCount = ({
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
    queryKey: ["buy-tx-count", userId, period, timeFrame],
    queryFn: () => getBuyTxCount({ userId, period, timeFrame }),
    enabled: !!!searchTerm,
  });
};

export const useBuyTxByUser = (userId: string) => {
  return useQuery({
    queryKey: ["buy-tx-by-user", userId],
    queryFn: () => getBuyTxByUser(userId),
  });
};

export const useBuyTxByUserByPeriod = ({
  userId,
  period,
  timeFrame,
  searchTerm,
  isBuyTx,
}: {
  userId: string;
  period: Period;
  timeFrame: TimeFrame;
  searchTerm: string;
  isBuyTx: boolean;
}) => {
  return useQuery({
    queryKey: ["buy-tx-user-period", userId, period, timeFrame, searchTerm],
    queryFn: () =>
      getBuyTxByUserByPeriod({ userId, period, timeFrame, searchTerm }),
    enabled: isBuyTx,
  });
};

//---QRY-buyTransactions-for-user---
export const useBuyTxByUserProduct = ({
  userId,
  productId,
}: {
  userId: string;
  productId: string;
}) => {
  return useQuery({
    queryKey: ["buy-tx-by-user-product", userId, productId],
    queryFn: () => getBuyTxByUserProduct({ userId, productId }),
  });
};
