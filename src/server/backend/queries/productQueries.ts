import { useQuery } from "@tanstack/react-query";
import {
  getProductById,
  getProducts,
  getProductsBySupplier,
  getProductsBySupplierPagination,
  getProductsCount,
  getProductsForPicker,
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

export const useProducts = (userId: string) => {
  return useQuery({
    queryKey: ["products", userId],
    queryFn: () => getProducts(userId),
  });
};

export const useProductById = ({
  productId,
  userId,
}: {
  productId: string;
  userId: string;
}) => {
  return useQuery({
    queryKey: ["product-by-id", productId, userId],
    queryFn: () => getProductById({ productId, userId }),
  });
};

export const useProductsBySupplier = ({
  supplierId,
  userId,
}: {
  supplierId: string;
  userId: string;
}) => {
  return useQuery({
    queryKey: ["products-by-supplier", supplierId, userId],
    queryFn: () => getProductsBySupplier({ supplierId, userId }),
  });
};

export const useProductsBySupplierPagination = ({
  supplierId,
  userId,
  page,
  searchTerm,
}: {
  supplierId: string;
  userId: string;
  page: number;
  searchTerm: string;
}) => {
  return useQuery({
    queryKey: [
      "products-by-supplier-pagination",
      supplierId,
      page,
      userId,
      searchTerm,
    ],
    queryFn: () =>
      getProductsBySupplierPagination({ supplierId, page, userId, searchTerm }),
  });
};

export const useProductsCount = ({
  supplierId,
  userId,
}: {
  supplierId: string;
  userId: string;
}) => {
  return useQuery({
    queryKey: ["products-count", supplierId],
    queryFn: () => getProductsCount({ supplierId, userId }),
  });
};

//==Products for Picker
export const useProductsForPicker = ({
  userId,
  supplierId,
  sellMode,
}: {
  userId: string;
  supplierId: string;
  sellMode: boolean;
}) => {
  return useQuery({
    queryKey: ["products-picker", userId, supplierId],
    queryFn: () => getProductsForPicker({ supplierId, userId, sellMode }),
  });
};
