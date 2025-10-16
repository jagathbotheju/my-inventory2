import { formatPrice } from "@/lib/utils";
import { SellTxInvoiceExt } from "@/server/db/schema/sellTxInvoices";
import PaymentAddDialog from "../PaymentAddDialog";
import { Button } from "../ui/button";
import PaymentHistoryDialog from "../PaymentHistoryDialog";
import { User } from "@/server/db/schema/users";
import { format } from "date-fns";
import { BuyTxInvoiceExt } from "@/server/db/schema/buyTxInvoices";
import { Progress } from "../ui/progress";

interface Props {
  // item: SellTxInvoiceExt | BuyTxInvoiceExt;
  user: User;
  isBuyTx?: boolean;
  buyTxInvoice?: BuyTxInvoiceExt;
  sellTxInvoice?: SellTxInvoiceExt;
}

const InvoiceCard = ({ user, isBuyTx, buyTxInvoice, sellTxInvoice }: Props) => {
  // let totalAmount;
  let sellTxTotalAmount = 0;
  let sellTxReceivedAmount = 0;

  let buyTxTotalAmount = 0;
  let buyTxPayedAmount = 0;

  //sell payments
  if (!isBuyTx && sellTxInvoice) {
    sellTxReceivedAmount = sellTxInvoice.sellTxPayments.reduce((acc, tx) => {
      const sellTxPaymentCheques = tx.sellTxPaymentCheques;
      const paymentMode = tx.paymentMode;

      if (
        paymentMode === "cash" ||
        paymentMode === "cheque" ||
        paymentMode === "cash-cheque"
      ) {
        const chequeAmount = sellTxPaymentCheques.reduce(
          (acc, item) => (acc += item.amount ?? 0),
          0
        );
        acc += (tx.cacheAmount ?? 0) + chequeAmount;
      }
      return acc;
    }, 0);
    sellTxTotalAmount = sellTxInvoice.sellTransactions.reduce(
      (acc, invoice) => (acc += invoice.quantity * invoice.unitPrice),
      0
    );
  }

  //buy payments
  if (isBuyTx && buyTxInvoice) {
    buyTxPayedAmount = buyTxInvoice.buyTxPayments.reduce((acc, tx) => {
      const buyTxPaymentCheques = tx.buyTxPaymentCheques;
      const paymentMode = tx.paymentMode;

      if (
        paymentMode === "cash" ||
        paymentMode === "cheque" ||
        paymentMode === "cash-cheque"
      ) {
        const chequeAmount = buyTxPaymentCheques.reduce(
          (acc, item) => (acc += item.amount ?? 0),
          0
        );
        acc += (tx.cacheAmount ?? 0) + chequeAmount;
      }
      return acc;
    }, 0);
    buyTxTotalAmount = buyTxInvoice.buyTransactions.reduce(
      (acc, invoice) => (acc += invoice.quantity * invoice.unitPrice),
      0
    );
  }

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
            {/* received/paid Amount */}
            <div className="flex items-center gap-1">
              <p className="text-xl font-semibold">
                {isBuyTx ? "Paid Amount" : "Received Amount"}
              </p>
              <p className="col-span-2 text-xl font-semibold">
                {isBuyTx
                  ? formatPrice(buyTxPayedAmount ?? 0)
                  : formatPrice(sellTxReceivedAmount ?? 0)}
              </p>
            </div>

            {/* totalAmount */}
            <div className="flex items-center gap-1">
              <p className="">Total Amount</p>
              <p className="col-span-2">
                {formatPrice(
                  isBuyTx ? buyTxTotalAmount ?? 0 : sellTxTotalAmount ?? 0
                )}
              </p>
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
                  disabled={sellTxReceivedAmount >= sellTxTotalAmount}
                  className="hover:bg-primary/50 font-bold border-primary/50 border p-2 disabled:bg-green-300"
                >
                  {sellTxReceivedAmount >= sellTxTotalAmount
                    ? "PAID"
                    : "ADD.PAY"}
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

            {/* BuyTx Payment History */}
            {isBuyTx && buyTxInvoice && (
              <PaymentHistoryDialog
                userId={user.id}
                buyTxInvoice={buyTxInvoice}
                totalAmount={buyTxTotalAmount ?? 0}
                payedReceivedAmount={buyTxPayedAmount}
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

            {/* SellTx Payment History */}
            {!isBuyTx && sellTxInvoice && (
              <PaymentHistoryDialog
                userId={user.id}
                sellTxInvoice={sellTxInvoice}
                totalAmount={sellTxTotalAmount ?? 0}
                payedReceivedAmount={sellTxReceivedAmount}
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
      {/* <Separator className="bg-primary/60 mb-2" /> */}
      <Progress
        indicatorClass="bg-green-600"
        value={
          isBuyTx
            ? Math.round((buyTxPayedAmount / buyTxTotalAmount) * 100)
            : Math.round((sellTxReceivedAmount / sellTxTotalAmount) * 100)
        }
        className="h-[2px]"
      />

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
