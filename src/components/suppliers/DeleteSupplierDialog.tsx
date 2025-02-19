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
import { useDeleteSupplier } from "@/server/backend/mutations/supplierMutations";
import { Supplier } from "@/server/db/schema/suppliers";
import { User } from "@/server/db/schema/users";

interface Props {
  children: React.ReactNode;
  supplier: Supplier;
  user: User;
}

const DeleteSupplierDialog = ({ children, supplier, user }: Props) => {
  const [open, setOpen] = useState(false);
  const { mutate: deleteSupplier } = useDeleteSupplier();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Supplier</DialogTitle>
          <DialogDescription className="hidden">
            Delete Supplier
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col">
          <p>
            Are you sure, to delete this{" "}
            <span className="font-semibold text-red-500 uppercase">
              {supplier.name}
            </span>{" "}
            Supplier.
          </p>

          <p>
            All the <span className="font-semibold text-red-500">Products</span>
            , related to this Supplier will also be deleted!
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="destructive"
            type="submit"
            onClick={() => {
              deleteSupplier({ supplierId: supplier.id, userId: user?.id });
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
export default DeleteSupplierDialog;
