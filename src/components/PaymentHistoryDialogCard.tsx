"use client";

import { formatPrice } from "@/lib/utils";
import { BuyTxPaymentCheques } from "@/server/db/schema/buyTxPaymentCheques";
import { BuyTxPaymentExt } from "@/server/db/schema/buyTxPayments";
import { SellTxPaymentCheques } from "@/server/db/schema/sellTxPaymentCheques";
import { SellTxPaymentExt } from "@/server/db/schema/sellTxPayments";
import { format } from "date-fns";

interface Props {
  sellTxPayment?: SellTxPaymentExt;
  buyTxPayment?: BuyTxPaymentExt;
}

const PaymentHistoryDialogCard = ({ sellTxPayment, buyTxPayment }: Props) => {
  // console.log("buyTx", buyTxPayment);
  // console.log("sellTx", sellTxPayment);

  const paymentModeCredit = (payment: SellTxPaymentExt | BuyTxPaymentExt) => (
    <div className="flex justify-between items-center px-8">
      <p className="text-md text-muted-foreground">
        {format(payment.date ?? new Date(), "yyyy-MMM-dd")}
      </p>
      <div className="flex gap-4 items-center">
        <p className="text-lg font-semibold">
          {formatPrice(payment.creditAmount ?? 0)}
        </p>
        <div className="w-20 h-full rounded-md p-1 bg-red-400">
          <p className="text-red-800 font-semibold text-center">CREDIT</p>
        </div>
      </div>
    </div>
  );

  const paymentModeCash = (payment: SellTxPaymentExt | BuyTxPaymentExt) => (
    <div className="flex justify-between items-center px-8 py-1">
      <p className="text-md text-muted-foreground">
        {format(payment.date ?? new Date(), "yyyy-MMM-dd")}
      </p>
      <div className="flex gap-4 items-center">
        <p className="text-lg font-semibold">
          {formatPrice(payment.cacheAmount ?? 0)}
        </p>
        <div className="w-20 h-full rounded-md p-1 bg-green-400">
          <p className="text-green-800 font-semibold text-center">CASH</p>
        </div>
      </div>
    </div>
  );

  const paymentModeCheque = ({
    cheques,
    date,
  }: {
    cheques: BuyTxPaymentCheques[] | SellTxPaymentCheques[];
    date: string;
  }) =>
    cheques?.map((cheque) => (
      <div
        key={cheque.id}
        className="flex justify-between items-center px-8 py-1"
      >
        <p className="text-md text-muted-foreground">
          {format(date ?? new Date(), "yyyy-MMM-dd")}
        </p>
        <div className="flex gap-4 items-center">
          <p className="uppercase">{cheque.chequeNumber}</p>
          <p className="uppercase">{cheque.bankName}</p>
          <p>{format(cheque.chequeDate as string, "yyyy-MM-dd")}</p>
          <p className="text-lg font-semibold">
            {formatPrice(cheque.amount ?? 0)}
          </p>
          <div className="w-20 h-full rounded-md p-1 bg-amber-400">
            <p className="text-amber-800 font-semibold text-center">CHEQUE</p>
          </div>
        </div>
      </div>
    ));

  const paymentModeCashCheque = (
    payment: SellTxPaymentExt | BuyTxPaymentExt
  ) => {
    const buyTx = buyTxPayment ? (payment as BuyTxPaymentExt) : undefined;
    const sellTx = sellTxPayment ? (payment as SellTxPaymentExt) : undefined;

    return (
      <div className="flex flex-col">
        {paymentModeCash(payment)}
        {paymentModeCheque({
          date: payment.date ?? new Date().toDateString(),
          cheques: buyTx
            ? buyTx?.buyTxPaymentCheques ?? []
            : sellTx?.sellTxPaymentCheques ?? [],
        })}
      </div>
    );
  };

  return (
    <div className="flex-col justify-start items-start">
      {/* credit */}
      {sellTxPayment &&
        sellTxPayment.paymentMode === "credit" &&
        paymentModeCredit(sellTxPayment)}
      {buyTxPayment &&
        buyTxPayment.paymentMode === "credit" &&
        paymentModeCredit(buyTxPayment)}

      {/* cash */}
      {sellTxPayment &&
        sellTxPayment.paymentMode === "cash" &&
        paymentModeCash(sellTxPayment)}
      {buyTxPayment &&
        buyTxPayment.paymentMode === "cash" &&
        paymentModeCash(buyTxPayment)}

      {/* cheque */}
      {sellTxPayment &&
        sellTxPayment.paymentMode === "cheque" &&
        paymentModeCheque({
          date: sellTxPayment.date ?? new Date().toDateString(),
          cheques: sellTxPayment.sellTxPaymentCheques,
        })}
      {buyTxPayment &&
        buyTxPayment.paymentMode === "cheque" &&
        paymentModeCheque({
          date: buyTxPayment.date ?? new Date().toDateString(),
          cheques: buyTxPayment.buyTxPaymentCheques,
        })}

      {/* cash-cheque */}
      {sellTxPayment &&
        sellTxPayment.paymentMode === "cash-cheque" &&
        paymentModeCashCheque(sellTxPayment)}
      {buyTxPayment &&
        buyTxPayment.paymentMode === "cash-cheque" &&
        paymentModeCashCheque(buyTxPayment)}
    </div>
  );
};

export default PaymentHistoryDialogCard;
