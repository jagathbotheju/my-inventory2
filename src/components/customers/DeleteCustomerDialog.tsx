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
import { Customer } from "@/server/db/schema/customers";
import { useDeleteCustomer } from "@/server/backend/mutations/customerMutations";

interface Props {
  children: React.ReactNode;
  customer: Customer;
}

const DeleteCustomerDialog = ({ children, customer }: Props) => {
  const [open, setOpen] = useState(false);
  const { mutate: deleteCustomer } = useDeleteCustomer();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Customer</DialogTitle>
          <DialogDescription className="hidden">
            Delete Customer
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col">
          <p>
            Are you sure, to delete this{" "}
            <span className="font-semibold text-red-500 uppercase">
              {customer.name}
            </span>{" "}
            Customer.
          </p>

          <p>
            All the <span className="font-semibold text-red-500">Data</span>,
            related to this Customer will also be deleted!
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="destructive"
            type="submit"
            onClick={() => {
              deleteCustomer(customer.id);
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
export default DeleteCustomerDialog;
