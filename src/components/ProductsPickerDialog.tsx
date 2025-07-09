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
import _ from "lodash";

interface Props {
  children: React.ReactNode;
  userId: string;
  sellMode?: boolean;
}

export type TableDataProductsPicker = {
  quantity: number;
  productNumber: string;
  productId: string;
  purchasedPrice?: number;
  // supplierId: string;
  // unit: string;
  // supplier: string;
  selectedRowId?: string;
  sellQuantity?: number;
  sellUnitPrice?: number;
  sellMode?: boolean;
};

const ProductsPickerDialog = ({ children, userId, sellMode }: Props) => {
  const [open, setOpen] = useState(false);
  const [supplier, setSupplier] = useState<Supplier>({} as Supplier);
  const { setSelectedProducts, setSelectedProductIds } = useProductStore();
  const { currentSupplier } = useProductStore();

  const { data: stocks } = useStocksBySupplier({
    sellMode,
    userId,
    // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
    supplierId: supplier && supplier.id ? supplier.id : currentSupplier?.id,
    // supplierId: "c55b7f22-38cb-40d4-bad4-4cb1bf63c4ab",
  });

  const tableData: TableDataProductsPicker[] | undefined = _.sortBy(
    stocks,
    "productNumber"
  )
    // ?.filter((stock) => stock.quantity > 0)
    ?.map((stock) => {
      const data = {
        quantity: stock.quantity,
        productNumber: stock.productNumber as string,
        productId: stock.productId,
        sellMode,
        purchasedPrice: stock.purchasedPrice,
        // supplierId: stock.supplierId,
        // unit: stock.products?.unitOfMeasurements?.unit,
        // supplier: stock.products?.suppliers?.name,
      } as TableDataProductsPicker;
      return data;
    });

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
          {tableData?.length ? (
            <DataTable
              columns={productTableColumns}
              data={tableData}
              sellMode={sellMode}
            />
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
