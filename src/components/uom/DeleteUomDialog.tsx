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
import { UnitOfMeasurement } from "@/server/db/schema/unitOfMeasurements";
import { useDeleteUom } from "@/server/backend/mutations/uomMutations";

interface Props {
  children: React.ReactNode;
  uom: UnitOfMeasurement;
}

const DeleteUomDialog = ({ children, uom }: Props) => {
  const [open, setOpen] = useState(false);
  const { mutate: deleteSupplier } = useDeleteUom();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete UOM</DialogTitle>
          <DialogDescription className="hidden">Delete UOM</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col">
          <p>
            Are you sure, to delete this{" "}
            <span className="font-semibold text-red-500 uppercase">
              {uom.unit}
            </span>{" "}
            Unit.
          </p>

          <p>
            All the <span className="font-semibold text-red-500">Data</span>,
            related to this UOM will also be deleted!
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="destructive"
            type="submit"
            onClick={() => {
              deleteSupplier(uom.id);
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
export default DeleteUomDialog;
