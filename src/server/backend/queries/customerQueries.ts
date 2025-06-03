import { useQuery } from "@tanstack/react-query";
import {
  getCustomerById,
  getCustomers,
  getCustomersBySupplier,
} from "../actions/customerActions";

export const useCustomers = (userId: string) => {
  return useQuery({
    queryKey: ["customers", userId],
    queryFn: () => getCustomers(userId),
  });
};

export const useCustomersBySupplier = ({
  userId,
  supplierId,
}: {
  userId: string;
  supplierId: string;
}) => {
  return useQuery({
    queryKey: ["customers-by-supplier", userId, supplierId],
    queryFn: () => getCustomersBySupplier({ userId, supplierId }),
    enabled: !!supplierId,
  });
};

export const useCustomerById = (id: string) => {
  return useQuery({
    queryKey: ["customer-by-id", id],
    queryFn: () => getCustomerById(id),
    enabled: !!id,
  });
};
