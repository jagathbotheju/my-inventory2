"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { ProductExt } from "@/server/db/schema/products";

interface Props {
  children: React.ReactNode;
  product: ProductExt;
}

const ViewProductDialog = ({ children, product }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-fit">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
          <DialogDescription className="hidden">View Product</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-2">
          <p className="whitespace-nowrap">Number</p>
          <p className="col-span-3">{product.productNumber}</p>
          <p className="whitespace-nowrap">Description</p>
          <p className="col-span-3">{product.description}</p>
          <p className="whitespace-nowrap">Sales Person</p>
          <p className="col-span-3">{product.suppliers.salesPerson}</p>
          <p className="whitespace-nowrap">Mobile</p>
          <p className="col-span-3">{product.suppliers.mobilePhone}</p>
          <p className="whitespace-nowrap">Office</p>
          <p className="col-span-3">{product.suppliers.mobilePhone}</p>
          <p className="whitespace-nowrap">UOM</p>
          <p className="col-span-3 uppercase">
            {product.unitOfMeasurements.unit}
          </p>
        </div>

        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default ViewProductDialog;
