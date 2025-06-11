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
import PaymentModePicker from "./PaymentModePicker";
import { Input } from "./ui/input";
import { useAddPayment } from "@/server/backend/mutations/invoiceMutations";

interface Props {
  children: React.ReactNode;
  invoiceNumber: string;
  invoiceId: string;
}

const PaymentAddDialog = ({ children, invoiceNumber, invoiceId }: Props) => {
  const [value, setValue] = useState<string>("");
  const [amount, setAmount] = useState(0);
  const [open, setOpen] = useState(false);

  const { mutate: addPayment } = useAddPayment();

  const addInvoicePayment = () => {
    const payment = {
      invoiceId,
      paymentMode: value,
      cashAmount: amount,
    };
    console.log("payment", payment);
    addPayment({ ...payment });
    setOpen(false);
  };

  const clearFields = () => {
    setValue("");
    setAmount(0);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[50%]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex justify-between items-center border border-b-primary border-t-transparent border-l-transparent border-r-transparent p-2">
              <p>Add Payment</p>
              <p className="uppercase">{invoiceNumber}</p>
            </div>
          </DialogTitle>
          <DialogDescription className="hidden">
            View the payment history for your account.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {/* payment mode */}
          <div className="grid grid-cols-6 items-center">
            <p className="font-semibold text-muted-foreground col-span-2">
              Select Payment Mode
            </p>
            <div className="col-span-4">
              <PaymentModePicker
                value={value}
                setValue={setValue}
                clearFields={clearFields}
              />
            </div>
          </div>

          {/* credit */}
          {value === "credit" && (
            <div className="mt-4 p-4 flex justify-center">
              <h3 className="text-2xl text-muted-foreground">
                Could not add Credit
              </h3>
            </div>
          )}

          {/* cash */}
          {value === "cash" && (
            <div className="grid grid-cols-6">
              <p className="font-semibold text-muted-foreground col-span-2">
                Amount
              </p>
              <Input
                value={amount}
                onChange={(e) => setAmount(+e.target.value)}
                type="number"
                placeholder="Enter cash amount"
                className="text-2xl font-semibold col-span-4"
              />
            </div>
          )}
        </div>
        <DialogFooter className="mt-6">
          <Button onClick={addInvoicePayment}>Add</Button>
          <DialogClose asChild>
            <Button className="" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentAddDialog;
