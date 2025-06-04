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
import { SellTransactionExt } from "@/server/db/schema/sellTransactions";
import { formatPrice } from "@/lib/utils";
import { format } from "date-fns";

interface Props {
  children: React.ReactNode;
  userId: string;
  transaction: SellTransactionExt[] | undefined;
  item: {
    invoiceNumber: string;
    totalPrice: number;
    totalCash: number;
    paymentMode: string;
  };
}

const PaymentHistoryDialog = ({ children, item, transaction }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[50%]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex flex-col p-1">
              <div className="flex justify-between items-center border border-b-primary border-t-transparent border-l-transparent border-r-transparent">
                <h3 className="text-xl font-semibold ">Payment History</h3>
                <div className="flex gap-2 items-center">
                  <p className="text-xl font-semibold text-muted-foreground">
                    Total Amount
                  </p>
                  <p className="text-xl font-semibold text-muted-foreground">
                    {item.totalPrice}
                  </p>
                </div>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription className="hidden">
            View the payment history for your account.
          </DialogDescription>
        </DialogHeader>
        {/* Payment details */}
        <div className="mt-4">
          {transaction && transaction.length > 0 ? (
            <div className="flex flex-col -mt-4">
              {transaction.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center px-8"
                >
                  <p className="text-md text-muted-foreground">
                    {format(item.date, "yyyy-MMM-dd")}
                  </p>
                  <div className="flex gap-4 items-center">
                    {item.paymentMode === "credit" && (
                      <div className="w-fit h-full rounded-md p-1 bg-red-400">
                        <p className="text-red-800 font-semibold">CREDIT</p>
                      </div>
                    )}
                    <span className="font-semibold text-lg">
                      {" "}
                      {formatPrice(item?.cacheAmount ?? 0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xl font-bold text-muted-foreground">
              No payment history available.
            </p>
          )}
        </div>
        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentHistoryDialog;
