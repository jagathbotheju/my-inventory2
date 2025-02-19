import { useQuery } from "@tanstack/react-query";
import { getSupplierById, getSuppliers } from "../actions/supplierActions";

export const useSuppliers = (userId: string) => {
  return useQuery({
    queryKey: ["suppliers", userId],
    queryFn: () => getSuppliers(userId),
  });
};

export const useSupplierById = ({
  supplierId,
  userId,
}: {
  supplierId: string;
  userId: string;
}) => {
  return useQuery({
    queryKey: ["supplier-by-id", supplierId, userId],
    queryFn: () => getSupplierById({ supplierId, userId }),
  });
};
