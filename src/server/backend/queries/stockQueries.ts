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

//--all-user-stocks---
export const useAllUserStocks = ({
  userId,
  searchTerm,
}: {
  userId: string;
  searchTerm: string;
}) => {
  return useQuery({
    queryKey: ["user-stocks", userId, searchTerm],
    queryFn: () => getAllUserStocks({ userId, searchTerm }),
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
