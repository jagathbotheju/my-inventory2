import { Supplier } from "@/server/db/schema/suppliers";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { RowSelectionState } from "@tanstack/react-table";
import { TableDataProductsPicker } from "@/components/ProductsPickerDialog";

export type ProductStore = {
  currentSupplier: Supplier;
  selectedProducts: TableDataProductsPicker[];
  updateSelectedProduct: (product: TableDataProductsPicker) => void;
  selectedProductIds: RowSelectionState;
  setCurrentSupplier: (supplier: Supplier) => void;
  setSelectedProducts: (products: TableDataProductsPicker[]) => void;
  setSelectedProductIds: (ids: RowSelectionState) => void;
  removeSelectedProduct: (product: TableDataProductsPicker) => void;
  removeSelectedProductId: (id: string) => void;
};

export const useProductStore = create<ProductStore>()(
  persist(
    (set) => ({
      selectedProductIds: {} as RowSelectionState,
      currentSupplier: {} as Supplier,
      selectedProducts: [] as TableDataProductsPicker[],
      setCurrentSupplier: (currentSupplier) => {
        set(() => ({
          currentSupplier,
        }));
      },
      setSelectedProducts: (products) => {
        set(() => ({
          selectedProducts: products,
        }));
      },
      updateSelectedProduct: (product) => {
        set((state) => {
          const update = state.selectedProducts.find(
            (item) => item.productId === product.productId
          )!;
          // if(!update) return [...state.selectedProducts]

          return {
            selectedProducts: [
              ...state.selectedProducts,
              {
                ...update,
                sellQuantity: product.sellQuantity,
                sellUnitPrice: product.sellUnitPrice,
              },
            ],
          };
        });
      },
      removeSelectedProduct: (product: TableDataProductsPicker) => {
        set((state) => ({
          selectedProducts: state.selectedProducts.filter(
            (item) =>
              item.productId === product.productId &&
              item.purchasedPrice !== product.purchasedPrice
          ),
        }));
      },

      setSelectedProductIds: (ids) => {
        set(() => ({
          selectedProductIds: ids,
        }));
      },
      removeSelectedProductId: (id) => {
        set((state) => ({
          selectedProductIds: Object.fromEntries(
            Object.entries(state.selectedProductIds).filter(
              ([key]) => key !== id
            )
          ),
        }));
      },
    }),
    { name: "product-store" }
  )
);
