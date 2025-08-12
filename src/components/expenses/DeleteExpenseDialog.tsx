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
import { useDeleteExpense } from "@/server/backend/mutations/expenseMutations";

interface Props {
  children: React.ReactNode;
  expenseId: string;
  userId: string;
}

const DeleteExpenseDialog = ({ children, expenseId, userId }: Props) => {
  const [open, setOpen] = useState(false);
  const { mutate: deleteExpense } = useDeleteExpense();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] dark:bg-slate-900 bg-slate-50">
        <DialogHeader>
          <DialogTitle>Delete Expense</DialogTitle>
          <DialogDescription className="hidden">
            Delete Expense
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col">
          <p>Are you sure, to delete this Expense</p>
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
              deleteExpense({ userId, expenseId });
              // deleteExpense({
              //   userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
              //   expenseId,
              // });
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
export default DeleteExpenseDialog;
