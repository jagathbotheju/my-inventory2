import { useQuery } from "@tanstack/react-query";
import {
  getCustomerById,
  getCustomers,
  searchCustomers,
} from "../actions/customerActions";

//---search-customers---
export const useSearchCustomers = ({
  searchTerm,
  userId,
}: {
  searchTerm: string;
  userId: string;
}) => {
  return useQuery({
    queryKey: ["search-customers", searchTerm, userId],
    queryFn: () => searchCustomers({ searchTerm, userId }),
    enabled: searchTerm.length >= 3,
  });
};

export const useCustomers = (userId: string) => {
  return useQuery({
    queryKey: ["customers", userId],
    queryFn: () => getCustomers(userId),
    enabled: userId.length > 0,
  });
};

export const useCustomerById = (id: string) => {
  return useQuery({
    queryKey: ["customer-by-id", id],
    queryFn: () => getCustomerById(id),
    enabled: !!id,
  });
};
