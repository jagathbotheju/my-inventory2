import { useQuery } from "@tanstack/react-query";
import {
  getAllStocks,
  getAllUserStocks,
  getStocks,
  getStocksBySupplier,
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
  });
};
