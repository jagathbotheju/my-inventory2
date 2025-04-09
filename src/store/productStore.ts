import { Supplier } from "@/server/db/schema/suppliers";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ProductStore = {
  currentSupplier: Supplier;
  setCurrentSupplier: (supplier: Supplier) => void;
};

export const useProductStore = create<ProductStore>()(
  persist(
    (set) => ({
      currentSupplier: {} as Supplier,
      setCurrentSupplier: (currentSupplier) => {
        set(() => ({
          currentSupplier,
        }));
      },
    }),
    { name: "product-store" }
  )
);
