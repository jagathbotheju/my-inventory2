import { useQuery } from "@tanstack/react-query";
import {
  getProductById,
  getProducts,
  getProductsBySupplier,
  getProductsBySupplierPagination,
  getProductsCount,
  searchProducts,
} from "../actions/productActions";

export const useSearchProducts = (searchTerm: string) => {
  return useQuery({
    queryKey: ["search-products", searchTerm],
    queryFn: () => {
      if (searchTerm.length > 3) return searchProducts(searchTerm);
      return [];
    },
    refetchOnMount: false,
  });
};

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });
};

export const useProductById = (id: string) => {
  return useQuery({
    queryKey: ["product-by-id", id],
    queryFn: () => getProductById(id),
  });
};

export const useProductsBySupplier = (supplierId: string) => {
  return useQuery({
    queryKey: ["products-by-supplier", supplierId],
    queryFn: () => getProductsBySupplier(supplierId),
  });
};

export const useProductsBySupplierPagination = ({
  supplierId,
  page,
}: {
  supplierId: string;
  page: number;
}) => {
  return useQuery({
    queryKey: ["products-by-supplier-pagination", supplierId, page],
    queryFn: () => getProductsBySupplierPagination({ supplierId, page }),
  });
};

export const useProductsCount = (supplierId: string) => {
  return useQuery({
    queryKey: ["products-count", supplierId],
    queryFn: () => getProductsCount(supplierId),
  });
};
