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
import { BuyTransactionExt } from "@/server/db/schema/buyTransactions";
import { useDeleteBuyTransaction } from "@/server/backend/mutations/buyTxMutations";

interface Props {
  children: React.ReactNode;
  tx: BuyTransactionExt;
  userId: string;
}

const DeleteBuyTxDialog = ({ children, tx, userId }: Props) => {
  const [open, setOpen] = useState(false);
  const { mutate: deleteBuyTransaction } = useDeleteBuyTransaction();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Transaction</DialogTitle>
          <DialogDescription className="hidden">
            Delete Transaction
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col">
          <p>
            Are you sure, to delete this{" "}
            <span className="font-semibold text-red-500 uppercase">
              {tx.products.productNumber}
            </span>{" "}
            Transaction.
          </p>

          <p>
            All the <span className="font-semibold text-red-500">Data</span>,
            related to this Transaction will also be deleted!
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="destructive"
            type="submit"
            onClick={() => {
              deleteBuyTransaction({ userId: userId, buyTx: tx });
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
export default DeleteBuyTxDialog;
