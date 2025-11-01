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
import { formatPrice } from "@/lib/utils";
import { SellTxInvoiceExt } from "@/server/db/schema/sellTxInvoices";
import { ScrollArea } from "./ui/scroll-area";
import PaymentHistoryDialogCard from "./PaymentHistoryDialogCard";
import { BuyTxInvoiceExt } from "@/server/db/schema/buyTxInvoices";

interface Props {
  children: React.ReactNode;
  sellTxInvoice?: SellTxInvoiceExt;
  buyTxInvoice?: BuyTxInvoiceExt;
  totalAmount: number;
  isBuyTx?: boolean;
  payedReceivedAmount: number;
}

const PaymentHistoryDialog = ({
  children,
  sellTxInvoice,
  buyTxInvoice,
  totalAmount,
  isBuyTx,
  payedReceivedAmount,
}: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={true}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[50%] h-[450px] flex flex-col dark:bg-slate-900 bg-slate-50">
        <DialogHeader>
          <DialogTitle>
            <div className="flex flex-col p-1">
              <div className="flex justify-between items-center border border-b-primary border-t-transparent border-l-transparent border-r-transparent">
                <h3 className="text-xl font-semibold ">Payment History</h3>
                <div className="flex gap-2 items-center">
                  <p className="text-xl font-semibold text-muted-foreground">
                    {isBuyTx ? "Payed Amt." : "Received Amt."}
                  </p>
                  <p className="text-xl font-semibold">
                    {formatPrice(payedReceivedAmount ?? 0)}
                  </p>
                  /{/* total amount */}
                  <p className="text-xl font-semibold text-muted-foreground">
                    Total Amt.
                  </p>
                  <p className="text-xl font-semibold text-muted-foreground">
                    {formatPrice(totalAmount)}
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
        <ScrollArea>
          <div className="mt-4">
            {/* SellTx Payment History */}
            {!isBuyTx && sellTxInvoice && sellTxInvoice.sellTxPayments ? (
              <div className="flex flex-col -mt-4 gap-2">
                {sellTxInvoice.sellTxPayments.map((item) => (
                  <PaymentHistoryDialogCard
                    key={item.id}
                    sellTxPayment={item}
                  />
                ))}
              </div>
            ) : // BuyTx Payment History
            isBuyTx && buyTxInvoice && buyTxInvoice.buyTxPayments ? (
              <div className="flex flex-col -mt-4 gap-2">
                {buyTxInvoice.buyTxPayments.map((item) => (
                  <PaymentHistoryDialogCard key={item.id} buyTxPayment={item} />
                ))}
              </div>
            ) : (
              <p className="text-xl font-bold text-muted-foreground">
                No payment history available.
              </p>
            )}
          </div>
        </ScrollArea>
        <DialogFooter className="mt-auto">
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentHistoryDialog;
