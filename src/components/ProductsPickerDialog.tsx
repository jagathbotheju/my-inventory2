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
import { useStocksBySupplier } from "@/server/backend/queries/stockQueries";
import { DataTable } from "./DataTable";
import { productTableColumns } from "./products/productTableColumns";
import { useProductStore } from "@/store/productStore";

interface Props {
  children: React.ReactNode;
  userId: string;
}

export type TableData = {
  productNumber: string;
  quantity: number;
  purchasedPrice: number;
  productId: string;
  supplierId: string;
  unit: string;
  // supplier: string;
  selectedRowId?: string;
  sellQuantity?: number;
  sellUnitPrice?: number;
};

const ProductsPickerDialog = ({ children, userId }: Props) => {
  const [open, setOpen] = useState(false);
  const [supplier, setSupplier] = useState<Supplier>({} as Supplier);
  const { setSelectedProducts, setSelectedProductIds } = useProductStore();
  const { currentSupplier } = useProductStore();

  const { data: stocks } = useStocksBySupplier({
    userId,
    // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
    supplierId: supplier && supplier.id ? supplier.id : currentSupplier?.id,
    // supplierId: "c55b7f22-38cb-40d4-bad4-4cb1bf63c4ab",
  });

  const tableData: TableData[] | undefined = stocks?.map((stock) => {
    const data = {
      productNumber: stock.productNumber as string,
      quantity: stock.quantity,
      purchasedPrice: stock.unitPrice,
      productId: stock.productId,
      supplierId: stock.supplierId,
      unit: stock.products?.unitOfMeasurements?.unit,
      supplier: stock.products?.suppliers?.name,
    } as TableData;
    return data;
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[50%]">
        <DialogHeader className="border-b-primary border border-t-transparent border-l-transparent border-r-transparent">
          <DialogTitle className="text-xl font-semibold">
            Select Products
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
          {tableData?.length ? (
            <DataTable columns={productTableColumns} data={tableData} />
          ) : (
            <div className="text-center text-muted-foreground mt-4 font-semibold">
              No products found for this supplier
            </div>
          )}

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
