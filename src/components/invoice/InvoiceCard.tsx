import { formatPrice } from "@/lib/utils";
import { SellTxInvoiceExt } from "@/server/db/schema/sellTxInvoices";
import PaymentAddDialog from "../PaymentAddDialog";
import { Button } from "../ui/button";
import PaymentHistoryDialog from "../PaymentHistoryDialog";
import { User } from "@/server/db/schema/users";
import { Separator } from "../ui/separator";
import { format } from "date-fns";

interface Props {
  item: SellTxInvoiceExt;
  user: User;
}

const InvoiceCard = ({ item, user }: Props) => {
  const totalAmount = item.sellTransactions.reduce(
    (acc, tx) => (acc += (tx.unitPrice ?? 0) * tx.quantity),
    0
  );

  return (
    <div className="flex flex-col py-4">
      {/* card heading */}
      <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
        <div className="flex flex-col">
          <h2 className="text-3xl font-semibold uppercase">
            {item.invoiceNumber}
          </h2>
          <p className="">{item.sellTransactions[0]?.customers?.name}</p>
        </div>

        {/* received Amount */}
        <div className="flex items-center gap-4 justify-between">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1">
              <p className="text-xl font-semibold">Received Amount</p>
              <p className="col-span-2 text-xl font-semibold">
                {formatPrice(item.totalCash ?? 0)}
              </p>
            </div>

            {/* totalAmount */}
            <div className="flex items-center gap-1">
              <p className="">Total Amount</p>
              <p className="col-span-2">{formatPrice(totalAmount)}</p>
            </div>
          </div>

          <div className="flex gap-1 items-center">
            {/* add payment dialog */}
            <PaymentAddDialog
              invoiceNumber={item.invoiceNumber}
              invoiceId={item.id}
            >
              <Button
                variant="secondary"
                className="hover:bg-primary/50 font-bold border-primary/50 border p-2"
              >
                ADD.PAY
              </Button>
            </PaymentAddDialog>

            {/* payment history dialog */}
            <PaymentHistoryDialog
              userId={user.id}
              sellTxInvoice={item}
              totalAmount={totalAmount}
            >
              <Button
                variant="secondary"
                className="hover:bg-primary/50 font-bold border-primary/50 border p-2"
              >
                PAY.HIS
              </Button>
            </PaymentHistoryDialog>
          </div>
        </div>
      </div>
      <Separator className="bg-primary/20 mb-2" />
      {item.sellTransactions.map((tx, index) => (
        <div
          key={index}
          className="grid grid-cols-10 gap-5 hover:bg-primary/10 p-1 text-muted-foreground"
        >
          <p className="col-span-2 justify-self-end">
            {format(tx.date, "yyyy-MM-dd")}
          </p>
          <p className="col-span-4 uppercase">{tx.products?.productNumber}</p>
          <p className="col-span-2">
            ({tx.quantity} X {formatPrice(tx.unitPrice ?? 0)})
          </p>
          <p className="col-span-2">
            {formatPrice(tx.quantity * (tx.unitPrice ?? 0))}
          </p>
        </div>
      ))}
    </div>
  );
};

export default InvoiceCard;
