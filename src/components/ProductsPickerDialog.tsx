"use client";
import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import SupplierPicker from "./SupplierPicker";
import { Supplier } from "@/server/db/schema/suppliers";
import { DataTable } from "./DataTable";
import { productTableColumns } from "./products/productTableColumns";
import { useProductStore } from "@/store/productStore";
import { useProductsForPicker } from "@/server/backend/queries/productQueries";

interface Props {
  children: React.ReactNode;
  userId: string;
  sellMode: boolean;
}

export type TableDataProductsPicker = {
  productId: string;
  productNumber: string;
  unit: string;
  sellMode?: boolean;
  selectedRowId?: string;
  quantity?: number;
  purchasedPrice?: Array<number>;
  // purchasedPrice?: Set<number>;
};

const ProductsPickerDialog = ({ children, userId, sellMode }: Props) => {
  const [open, setOpen] = useState(false);
  const [supplier, setSupplier] = useState<Supplier>({} as Supplier);
  const { setSelectedProducts, setSelectedProductIds } = useProductStore();
  const { currentSupplier } = useProductStore();

  //Products for Picker
  const { data: products } = useProductsForPicker({
    userId,
    supplierId: supplier && supplier.id ? supplier.id : currentSupplier?.id,
    sellMode,
  });

  // console.log("products", products);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[50%]">
        <DialogHeader className="border-b-primary border border-t-transparent border-l-transparent border-r-transparent">
          <DialogTitle className="text-xl font-semibold">
            {sellMode
              ? "Select Products for Selling"
              : "Select Products for Purchasing"}
          </DialogTitle>
          <DialogDescription className="hidden">
            select products to sell
          </DialogDescription>
        </DialogHeader>

        <div className="flex w-full flex-col gap-4 mt-2">
          <div className="grid grid-cols-12 gap-4 items-center">
            {/* suppliers */}
            <p className="whitespace-nowrap text-lg col-span-3 font-semibold text-muted-foreground">
              Select Supplier
            </p>
            <div className="whitespace-nowrap text-lg col-span-8">
              <SupplierPicker
                userId={userId}
                setSupplier={setSupplier}
                supplierId={currentSupplier ? currentSupplier.id : ""}
              />
            </div>
          </div>

          {/* product table */}
          <DataTable
            columns={productTableColumns}
            data={products ?? []}
            sellMode={sellMode}
          />

          {/* footer */}
          <DialogFooter className="sm:justify-start mt-8">
            <div className="flex gap-2">
              {/* select */}
              <Button onClick={() => setOpen(false)}>Select</Button>

              {/* clear */}
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setSelectedProducts([]);
                    setSelectedProductIds({});
                  }}
                >
                  Clear
                </Button>
              </DialogClose>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductsPickerDialog;
