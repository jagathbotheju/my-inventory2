"use client";

import { formatPrice } from "@/lib/utils";
import { BuyTxPaymentExt } from "@/server/db/schema/buyTxPayments";
import { SellTxPaymentExt } from "@/server/db/schema/sellTxPayments";
import { format } from "date-fns";

interface Props {
  sellTxPayment?: SellTxPaymentExt;
  buyTxPayment?: BuyTxPaymentExt;
  isBuyTx?: boolean;
}

const PaymentHistoryDialogCard = ({
  isBuyTx,
  sellTxPayment,
  buyTxPayment,
}: Props) => {
  const item = isBuyTx ? buyTxPayment : sellTxPayment;
  const buyTx = isBuyTx && buyTxPayment;
  const sellTx = !isBuyTx && sellTxPayment;

  return (
    <div className="flex-col justify-start items-start">
      {/* credit */}
      {item?.paymentMode === "credit" && (
        <div className="flex justify-between items-center px-8">
          <p className="text-md text-muted-foreground">
            {format(item.createdAt, "yyyy-MMM-dd")}
          </p>
          <div className="flex gap-4 items-center">
            <p className="text-lg font-semibold">
              {formatPrice(item.creditAmount ?? 0)}
            </p>
            <div className="w-fit h-full rounded-md p-1 bg-red-400">
              <p className="text-red-800 font-semibold text-center">CREDIT</p>
            </div>
          </div>
        </div>
      )}

      {/* cash */}
      {item?.paymentMode === "cash" && (
        <div className="flex justify-between items-center px-8">
          <p className="text-md text-muted-foreground">
            {format(item.createdAt, "yyyy-MMM-dd")}
          </p>
          <div className="flex gap-4 items-center">
            <p className="text-lg font-semibold">
              {formatPrice(item.cacheAmount ?? 0)}
            </p>
            <div className="w-20 h-full rounded-md p-1 bg-green-400">
              <p className="text-green-800 font-semibold text-center">CASH</p>
            </div>
          </div>
        </div>
      )}

      {/* cheque */}
      {item?.paymentMode === "cheque" &&
        sellTx &&
        sellTx.sellTxPaymentCheques.length &&
        sellTx.sellTxPaymentCheques.map((cheque, index) => (
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
              <p>{format(cheque.chequeDate as string, "yyyy-MM-dd")}</p>
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
      {item?.paymentMode === "cheque" &&
        buyTx &&
        buyTx.buyTxPaymentCheques.length &&
        buyTx.buyTxPaymentCheques.map((cheque, index) => (
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
              <p>{format(cheque.chequeDate as string, "yyyy-MM-dd")}</p>
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
        {item?.paymentMode === "cash-cheque" &&
          sellTx &&
          sellTx.sellTxPaymentCheques.length &&
          sellTx.sellTxPaymentCheques.map((cheque, index) => (
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
                  <p className="uppercase">{cheque.chequeNumber}</p>
                  <p className="uppercase">{cheque.bankName}</p>
                  <p>{format(cheque.chequeDate as string, "yyyy-MM-dd")}</p>
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

      <div className="flex flex-col">
        {item?.paymentMode === "cash-cheque" &&
          buyTx &&
          buyTx.buyTxPaymentCheques.length &&
          buyTx.buyTxPaymentCheques.map((cheque, index) => (
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
                  <p className="uppercase">{cheque.chequeNumber}</p>
                  <p className="uppercase">{cheque.bankName}</p>
                  <p>{format(cheque.chequeDate as string, "yyyy-MM-dd")}</p>
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
  );
};

export default PaymentHistoryDialogCard;
