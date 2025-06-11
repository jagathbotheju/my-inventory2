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
import { format } from "date-fns";
import { SellTxInvoiceExt } from "@/server/db/schema/sellTxInvoices";
import { ScrollArea } from "./ui/scroll-area";

interface Props {
  children: React.ReactNode;
  userId: string;
  sellTxInvoice: SellTxInvoiceExt;
  totalAmount: number;
}

const PaymentHistoryDialog = ({
  children,
  sellTxInvoice,
  totalAmount,
}: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={true}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[50%] h-[450px]">
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
                    {formatPrice(totalAmount)}
                  </p>
                  /
                  <p className="text-xl font-semibold">
                    {formatPrice(sellTxInvoice.totalCash ?? 0)}
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
        <ScrollArea className="">
          <div className="mt-4">
            {sellTxInvoice && sellTxInvoice.sellTxPayments.length > 0 ? (
              <div className="flex flex-col -mt-4 gap-2">
                {sellTxInvoice.sellTxPayments.map((item) => (
                  <div key={item.id}>
                    {/* credit */}
                    {item.paymentMode === "credit" && (
                      <div className="flex justify-between items-center px-8">
                        <p className="text-md text-muted-foreground">
                          {format(item.createdAt, "yyyy-MMM-dd")}
                        </p>
                        <div className="flex gap-4 items-center">
                          <div className="w-fit h-full rounded-md p-1 bg-red-400">
                            <p className="text-red-800 font-semibold text-center">
                              CREDIT
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* cash */}
                    {item.paymentMode === "cash" && (
                      <div className="flex justify-between items-center px-8">
                        <p className="text-md text-muted-foreground">
                          {format(item.createdAt, "yyyy-MMM-dd")}
                        </p>
                        <div className="flex gap-4 items-center">
                          <p className="text-lg font-semibold">
                            {formatPrice(item.cacheAmount ?? 0)}
                          </p>
                          <div className="w-20 h-full rounded-md p-1 bg-green-400">
                            <p className="text-green-800 font-semibold text-center">
                              CASH
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* cheque */}
                    {item.paymentMode === "cheque" &&
                      item.sellTxPaymentCheques.length &&
                      item.sellTxPaymentCheques.map((cheque, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center px-8 py-1"
                        >
                          <p className="text-md text-muted-foreground">
                            {format(cheque.createdAt, "yyyy-MMM-dd")}
                          </p>
                          <div className="flex gap-4 items-center">
                            <p className="uppercase">{cheque.chequeNumber}</p>
                            <p className="uppercase">{cheque.bankName}</p>
                            <p>
                              {format(
                                cheque.chequeDate as string,
                                "yyyy-MM-dd"
                              )}
                            </p>
                            <p className="text-lg font-semibold">
                              {formatPrice(cheque.amount ?? 0)}
                            </p>
                            <div className="w-20 h-full rounded-md p-1 bg-amber-400">
                              <p className="text-amber-800 font-semibold text-center">
                                CHEQUE
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}

                    {/* cash & cheque */}
                    <div className="flex flex-col">
                      {item.paymentMode === "cash-cheque" &&
                        item.sellTxPaymentCheques.length &&
                        item.sellTxPaymentCheques.map((cheque, index) => (
                          <div key={index} className="">
                            <div className="flex justify-between items-center px-8 py-2">
                              <p className="text-md text-muted-foreground">
                                {format(item.createdAt, "yyyy-MMM-dd")}
                              </p>
                              <div className="flex gap-4 items-center">
                                <p className="text-lg font-semibold">
                                  {formatPrice(item.cacheAmount ?? 0)}
                                </p>
                                <div className="w-20 h-full rounded-md p-1 bg-green-400">
                                  <p className="text-green-800 font-semibold text-center">
                                    CASH
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-between items-center px-8">
                              <p className="text-md text-muted-foreground">
                                {format(cheque.createdAt, "yyyy-MMM-dd")}
                              </p>
                              <div className="flex gap-4 items-center">
                                <p className="uppercase">
                                  {cheque.chequeNumber}
                                </p>
                                <p className="uppercase">{cheque.bankName}</p>
                                <p>
                                  {format(
                                    cheque.chequeDate as string,
                                    "yyyy-MM-dd"
                                  )}
                                </p>
                                <p className="text-lg font-semibold">
                                  {formatPrice(cheque.amount ?? 0)}
                                </p>
                                <div className="w-20 h-full rounded-md p-1 bg-amber-400">
                                  <p className="text-amber-800 font-semibold text-center">
                                    CHEQUE
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
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
        </ScrollArea>
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
