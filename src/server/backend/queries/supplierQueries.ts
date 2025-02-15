import { useQuery } from "@tanstack/react-query";
import { getSupplierById, getSuppliers } from "../actions/supplierActions";

export const useSuppliers = () => {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: () => getSuppliers(),
  });
};

export const useSupplierById = (id: string) => {
  return useQuery({
    queryKey: ["supplier-by-id", id],
    queryFn: () => getSupplierById(id),
  });
};
