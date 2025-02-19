import { useQuery } from "@tanstack/react-query";
import { getCustomerById, getCustomers } from "../actions/customerActions";

export const useCustomers = (userId: string) => {
  return useQuery({
    queryKey: ["customers", userId],
    queryFn: () => getCustomers(userId),
  });
};

export const useCustomerById = (id: string) => {
  return useQuery({
    queryKey: ["customer-by-id", id],
    queryFn: () => getCustomerById(id),
  });
};
