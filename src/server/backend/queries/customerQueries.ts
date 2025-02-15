import { useQuery } from "@tanstack/react-query";
import { getCustomerById, getCustomers } from "../actions/customerActions";

export const useCustomers = () => {
  return useQuery({
    queryKey: ["customers"],
    queryFn: () => getCustomers(),
  });
};

export const useCustomerById = (id: string) => {
  return useQuery({
    queryKey: ["customer-by-id", id],
    queryFn: () => getCustomerById(id),
  });
};
