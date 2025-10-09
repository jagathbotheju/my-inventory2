import { useQuery } from "@tanstack/react-query";
import {
  getCustomerById,
  getCustomers,
  searchCustomers,
} from "../actions/customerActions";

export const useSearchCustomers = ({
  searchTerm,
  userId,
}: {
  searchTerm: string;
  userId: string;
}) => {
  return useQuery({
    queryKey: ["search-customers", searchTerm, userId],
    queryFn: () => {
      if (searchTerm.length > 3) return searchCustomers({ searchTerm, userId });
      return [];
    },
    refetchOnMount: false,
  });
};

export const useCustomers = (userId: string) => {
  return useQuery({
    queryKey: ["customers", userId],
    queryFn: () => getCustomers(userId),
    enabled: userId.length > 0,
  });
};

// export const useCustomersBySupplier = ({
//   userId,
//   supplierId,
// }: {
//   userId: string;
//   supplierId: string;
// }) => {
//   return useQuery({
//     queryKey: ["customers-by-supplier", userId, supplierId],
//     queryFn: () => getCustomersBySupplier({ userId, supplierId }),
//     enabled: !!supplierId,
//   });
// };

export const useCustomerById = (id: string) => {
  return useQuery({
    queryKey: ["customer-by-id", id],
    queryFn: () => getCustomerById(id),
    enabled: !!id,
  });
};
