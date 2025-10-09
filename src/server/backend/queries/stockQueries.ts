import { useQuery } from "@tanstack/react-query";
import {
  getAllStocks,
  getAllUserStocks,
  getAllUserStocksByPeriod,
  getStocks,
  getStocksBySupplier,
  searchStocks,
} from "../actions/stockActions";

export const useStocks = ({
  userId,
  productId,
  supplierId,
}: {
  userId: string;
  productId: string;
  supplierId: string;
}) => {
  return useQuery({
    queryKey: ["stocks", userId, productId, supplierId],
    queryFn: () => getStocks({ userId, productId, supplierId }),
  });
};

export const useAllStocks = (userId: string) => {
  return useQuery({
    queryKey: ["stocks", userId],
    queryFn: () => getAllStocks(userId),
  });
};

export const useAllUserStocks = (userId: string) => {
  return useQuery({
    queryKey: ["user-stocks", userId],
    queryFn: () => getAllUserStocks(userId),
  });
};

export const useSearchStocks = ({
  userId,
  searchTerm,
}: {
  userId: string;
  searchTerm: string;
}) => {
  return useQuery({
    queryKey: ["search-stocks", userId, searchTerm],
    queryFn: () => searchStocks({ userId, searchTerm }),
    enabled: searchTerm.length >= 3,
  });
};

export const useAllUserStocksByPeriod = ({
  userId,
  period,
  timeFrame,
  searchTerm,
}: {
  userId: string;
  period: Period;
  timeFrame: TimeFrame | "all";
  searchTerm: string;
}) => {
  return useQuery({
    queryKey: ["user-stocks-by-period", userId, period, timeFrame],
    queryFn: () => getAllUserStocksByPeriod({ userId, period, timeFrame }),
    enabled: !!!searchTerm,
  });
};

export const useStocksBySupplier = ({
  userId,
  supplierId,
}: {
  userId: string;
  supplierId: string;
}) => {
  return useQuery({
    queryKey: ["stocks-supplier", userId, supplierId],
    queryFn: () => getStocksBySupplier({ userId, supplierId }),
    enabled: !!supplierId,
  });
};
