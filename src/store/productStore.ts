import { TableData } from "@/components/ProductsPickerDialog";
import { Supplier } from "@/server/db/schema/suppliers";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { RowSelectionState } from "@tanstack/react-table";

export type ProductStore = {
  currentSupplier: Supplier;
  selectedProducts: TableData[];
  updateSelectedProduct: (product: TableData) => void;
  selectedProductIds: RowSelectionState;
  setCurrentSupplier: (supplier: Supplier) => void;
  setSelectedProducts: (products: TableData[]) => void;
  setSelectedProductIds: (ids: RowSelectionState) => void;
  removeSelectedProduct: (productId: string) => void;
  removeSelectedProductId: (id: string) => void;
};

export const useProductStore = create<ProductStore>()(
  persist(
    (set) => ({
      selectedProductIds: {} as RowSelectionState,
      currentSupplier: {} as Supplier,
      selectedProducts: [] as TableData[],
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
      removeSelectedProduct: (productId: string) => {
        set((state) => ({
          selectedProducts: state.selectedProducts.filter(
            (product) => product.productId !== productId
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
