import { formatPrice } from "@/lib/utils";
import { SellTxInvoiceExt } from "@/server/db/schema/sellTxInvoices";
import PaymentAddDialog from "../PaymentAddDialog";
import { Button } from "../ui/button";
import PaymentHistoryDialog from "../PaymentHistoryDialog";
import { User } from "@/server/db/schema/users";
import { Separator } from "../ui/separator";
import { format } from "date-fns";
import { BuyTxInvoiceExt } from "@/server/db/schema/buyTxInvoices";

interface Props {
  // item: SellTxInvoiceExt | BuyTxInvoiceExt;
  user: User;
  isBuyTx?: boolean;
  buyTxInvoice?: BuyTxInvoiceExt;
  sellTxInvoice?: SellTxInvoiceExt;
}

const InvoiceCard = ({ user, isBuyTx, buyTxInvoice, sellTxInvoice }: Props) => {
  console.log("isBuyTx Card", isBuyTx);
  let totalAmount;
  if (!isBuyTx && sellTxInvoice) {
    totalAmount = sellTxInvoice.sellTransactions.reduce(
      (acc, tx) => (acc += (tx.unitPrice ?? 0) * tx.quantity),
      0
    );
  }
  if (isBuyTx && buyTxInvoice) {
    totalAmount = buyTxInvoice.buyTransactions.reduce(
      (acc, tx) => (acc += (tx.unitPrice ?? 0) * tx.quantity),
      0
    );
  }

  // console.log("sellTxInvoice", sellTxInvoice?.invoiceNumber);

  return (
    <div className="flex flex-col">
      {/* card heading */}
      <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
        <div className="flex flex-col">
          <h2 className="text-3xl font-semibold uppercase">
            {isBuyTx
              ? buyTxInvoice?.invoiceNumber
              : sellTxInvoice?.invoiceNumber}
          </h2>
          <p className="">
            {isBuyTx
              ? buyTxInvoice?.buyTransactions[0]?.products?.suppliers?.name
              : sellTxInvoice?.sellTransactions[0]?.customers?.name}
          </p>
        </div>

        <div className="flex items-center gap-4 justify-between">
          <div className="flex flex-col items-end">
            {/* received Amount */}
            <div className="flex items-center gap-1">
              <p className="text-xl font-semibold">
                {isBuyTx ? "Paid Amount" : "Received Amount"}
              </p>
              <p className="col-span-2 text-xl font-semibold">
                {isBuyTx
                  ? formatPrice(buyTxInvoice?.totalAmount ?? 0)
                  : formatPrice(sellTxInvoice?.totalAmount ?? 0)}
              </p>
            </div>

            {/* totalAmount */}
            <div className="flex items-center gap-1">
              <p className="">Total Amount</p>
              <p className="col-span-2">{formatPrice(totalAmount ?? 0)}</p>
            </div>
          </div>

          <div className="flex gap-1 items-center">
            {/* SellTx Add Payment */}
            {!isBuyTx && sellTxInvoice && (
              <PaymentAddDialog
                invoiceNumber={sellTxInvoice.invoiceNumber}
                invoiceId={sellTxInvoice.id}
              >
                <Button
                  variant="secondary"
                  className="hover:bg-primary/50 font-bold border-primary/50 border p-2"
                >
                  ADD.PAY
                </Button>
              </PaymentAddDialog>
            )}

            {/* BuyTx Add Payment */}
            {isBuyTx && buyTxInvoice && (
              <PaymentAddDialog
                invoiceNumber={buyTxInvoice.invoiceNumber}
                invoiceId={buyTxInvoice.id}
                isBuyTx
              >
                <Button
                  variant="secondary"
                  className="hover:bg-primary/50 font-bold border-primary/50 border p-2"
                >
                  ADD.PAY
                </Button>
              </PaymentAddDialog>
            )}

            {/* SellTx Payment History */}
            {isBuyTx && buyTxInvoice && (
              <PaymentHistoryDialog
                userId={user.id}
                buyTxInvoice={buyTxInvoice}
                totalAmount={totalAmount ?? 0}
                isBuyTx
              >
                <Button
                  variant="secondary"
                  className="hover:bg-primary/50 font-bold border-primary/50 border p-2"
                >
                  PAY.HIS
                </Button>
              </PaymentHistoryDialog>
            )}

            {/* BuyTx Payment History */}
            {!isBuyTx && sellTxInvoice && (
              <PaymentHistoryDialog
                userId={user.id}
                sellTxInvoice={sellTxInvoice}
                totalAmount={totalAmount ?? 0}
              >
                <Button
                  variant="secondary"
                  className="hover:bg-primary/50 font-bold border-primary/50 border p-2"
                >
                  PAY.HIS
                </Button>
              </PaymentHistoryDialog>
            )}
          </div>
        </div>
      </div>
      <Separator className="bg-primary/20 mb-2" />

      {isBuyTx && buyTxInvoice
        ? buyTxInvoice.buyTransactions.map((tx, index) => (
            <div
              key={index}
              className="grid grid-cols-10 gap-5 hover:bg-primary/10 p-1 text-muted-foreground"
            >
              <p className="col-span-2 justify-self-end">
                {format(tx.date, "yyyy-MM-dd")}
              </p>
              <p className="col-span-4 uppercase">
                {tx.products?.productNumber}
              </p>
              <p className="col-span-2">
                ({tx.quantity} X {formatPrice(tx.unitPrice ?? 0)})
              </p>
              <p className="col-span-2">
                {formatPrice(tx.quantity * (tx.unitPrice ?? 0))}
              </p>
            </div>
          ))
        : sellTxInvoice &&
          sellTxInvoice.sellTransactions.map((tx, index) => (
            <div
              key={index}
              className="grid grid-cols-10 gap-5 hover:bg-primary/10 p-1 text-muted-foreground"
            >
              <p className="col-span-2 justify-self-end">
                {format(tx.date, "yyyy-MM-dd")}
              </p>
              <p className="col-span-4 uppercase">
                {tx.products?.productNumber}
              </p>
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
