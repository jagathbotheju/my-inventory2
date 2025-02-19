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
import { useDeleteProduct } from "@/server/backend/mutations/productMutations";
import { Product } from "@/server/db/schema/products";

interface Props {
  children: React.ReactNode;
  product: Product;
  userId: string;
}

const DeleteProductDialog = ({ children, product, userId }: Props) => {
  const [open, setOpen] = useState(false);
  const { mutate: deleteProduct } = useDeleteProduct();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Product</DialogTitle>
          <DialogDescription className="hidden">
            Delete Product
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col">
          <p>
            Are you sure, to delete this{" "}
            <span className="font-semibold text-red-500 uppercase">
              {product.productNumber}
            </span>{" "}
            Product.
          </p>

          <p>
            All the <span className="font-semibold text-red-500">Data</span>,
            related to this Product will also be deleted!
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="destructive"
            type="submit"
            onClick={() => {
              deleteProduct({ productId: product.id, userId });
              setOpen(false);
            }}
          >
            Delete
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default DeleteProductDialog;
