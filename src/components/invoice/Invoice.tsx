"use client";
import { User } from "@/server/db/schema/users";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import TimeFramePicker from "../TimeFramePicker";
import { useTimeFrameStore } from "@/store/timeFrameStore";
import {
  useBuyTxByUserByPeriod,
  useByTxTotalPurchase,
} from "@/server/backend/queries/buyTxQueries";
import { Separator } from "../ui/separator";
import { format } from "date-fns";
import { formatPrice } from "@/lib/utils";
import { Button } from "../ui/button";
import { useState } from "react";
import {
  useSellTxByUserByPeriod,
  useSellTxTotalSales,
} from "@/server/backend/queries/sellTxQueries";
import { SellTransactionExt } from "@/server/db/schema/sellTransactions";
import PaymentHistoryDialog from "../PaymentHistoryDialog";
// import _ from "lodash";

interface Props {
  user: User;
}

const Invoice = ({ user }: Props) => {
  const [isBuyTx, setIsBuyTx] = useState(true);
  const { period, timeFrame } = useTimeFrameStore((state) => state);
  const { data: buyTxs } = useBuyTxByUserByPeriod({
    // userId: user.id,
    userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
    period,
    timeFrame,
  });
  const { data: sellTxs } = useSellTxByUserByPeriod({
    userId: user.id,
    // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
    period,
    timeFrame,
  });

  const { data: totalPurchase } = useByTxTotalPurchase({
    // userId: user.id,
    userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
    period,
    timeFrame,
  });

  const { data: totalSales } = useSellTxTotalSales({
    // userId: user.id,
    userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
    period,
    timeFrame,
  });

  // console.log("buyTxs", buyTxs);

  const filteredBuyTxs = buyTxs?.reduce(
    (acc, buyTx) => {
      const exist = acc.find(
        (item) => item.invoiceNumber === buyTx.invoiceNumber
      );

      if (!exist) {
        acc.push({
          invoiceNumber: buyTx.invoiceNumber as string,
          totalPrice: buyTx.quantity * buyTx.unitPrice,
        });
      } else {
        exist.totalPrice += buyTx.quantity * buyTx.unitPrice;
      }
      return acc;
    },
    Array<{
      invoiceNumber: string;
      totalPrice: number;
    }>()
  );

  const getCashAmount = (sellTx: SellTransactionExt, exist: boolean) => {
    let cash = 0;
    if (sellTx.paymentMode === "cash" && sellTx.cacheAmount) {
      cash += sellTx.cacheAmount;
    }
    if (sellTx.paymentMode === "cheque" && sellTx.sellTxCheques?.length) {
      cash += sellTx.sellTxCheques?.reduce(
        (acc, cheque) => acc + (cheque.amount ?? 0),
        0
      );
    }
    if (sellTx.paymentMode === "cash-cheque" && sellTx.cacheAmount) {
      cash += exist
        ? 0
        : sellTx.cacheAmount +
          (sellTx.sellTxCheques?.reduce(
            (acc, cheque) => acc + (cheque.amount ?? 0),
            0
          ) ?? 0);
    }
    return cash;
  };

  const filteredSellTxs = sellTxs?.reduce(
    (acc, sellTx) => {
      const exist = acc.find(
        (item) => item.invoiceNumber === sellTx.invoiceNumber
      );

      if (!exist) {
        acc.push({
          invoiceNumber: sellTx.invoiceNumber as string,
          totalPrice: sellTx.quantity * (sellTx?.unitPrice ?? 0),
          totalCash: getCashAmount(sellTx, false),
          paymentMode: sellTx.paymentMode ?? "NONE",
        });
      } else {
        exist.totalPrice += sellTx.quantity * (sellTx.unitPrice ?? 0);
        exist.totalCash += getCashAmount(sellTx, true);
      }
      return acc;
    },
    Array<{
      invoiceNumber: string;
      totalPrice: number;
      totalCash: number;
      paymentMode: string;
    }>()
  );

  // console.log("SellTxsTest", filteredSellTxs);

  return (
    <Card className="dark:bg-transparent dark:border-primary/40">
      <CardHeader>
        <CardTitle className="text-4xl font-bold">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center gap-1">
              <p>{isBuyTx ? "Buy Invoices," : "Sell Invoices,"}</p>
              {isBuyTx
                ? totalPurchase?.value && (
                    <p className="font-semibold text-muted-foreground">
                      {formatPrice(
                        totalPurchase && totalPurchase.value
                          ? parseFloat(totalPurchase.value)
                          : 0
                      )}
                    </p>
                  )
                : totalSales?.value && (
                    <p className="font-semibold text-muted-foreground">
                      {formatPrice(
                        totalSales && totalSales.value
                          ? parseFloat(totalSales.value)
                          : 0
                      )}
                    </p>
                  )}
            </div>

            <div className="flex flex-col md:flex-row gap-5 items-center">
              <TimeFramePicker />
              <div className="flex gap-2 items-center">
                <Button
                  size="sm"
                  className={`tracking-widest ${
                    isBuyTx ? "bg-primary font-semibold" : "bg-primary/70"
                  }`}
                  onClick={() => setIsBuyTx(true)}
                >
                  BUY
                </Button>
                <Button
                  size="sm"
                  className={`tracking-widest ${
                    !isBuyTx ? "bg-primary font-semibold" : "bg-primary/70"
                  }`}
                  onClick={() => setIsBuyTx(false)}
                >
                  SELL
                </Button>
              </div>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col w-full gap-y-10 mt-8">
          {/* buyTransactions */}
          {isBuyTx ? (
            filteredBuyTxs?.length ? (
              filteredBuyTxs?.map((item, index) => {
                const txs = buyTxs?.filter(
                  (x) => x.invoiceNumber === item.invoiceNumber
                );
                console.log("transactions", txs);
                return (
                  <div className="flex flex-col" key={index}>
                    <div className="flex justify-between">
                      <h2 className="text-3xl font-semibold text-muted-foreground uppercase">
                        {item.invoiceNumber}
                      </h2>
                      <p className="col-span-2 text-xl font-semibold text-muted-foreground">
                        {formatPrice(item.totalPrice)}
                      </p>
                    </div>
                    <Separator className="bg-primary/20 mb-2" />
                    {txs?.map((tx, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-10 gap-5 hover:bg-primary/10"
                      >
                        <p className="col-span-2 justify-self-end">
                          {format(tx.date, "yyyy-MM-dd")}
                        </p>
                        <p className="col-span-4">{tx.productNumber}</p>
                        <p className="col-span-2">
                          ({tx.quantity} X {formatPrice(tx.unitPrice)})
                        </p>
                        <p className="col-span-2">
                          {formatPrice(tx.quantity * tx.unitPrice)}
                        </p>
                      </div>
                    ))}
                  </div>
                );
              })
            ) : (
              <div className="mt-10 flex justify-center">
                <h2 className="text-4xl font-semibold text-muted-foreground">
                  No Purchase Invoices Found!
                </h2>
              </div>
            )
          ) : // sellTransactions
          filteredSellTxs?.length ? (
            filteredSellTxs?.map((item, index) => {
              const txs = sellTxs?.filter(
                (x) => x.invoiceNumber === item.invoiceNumber
              );
              console.log("sellTxs", txs);
              return (
                <div className="flex flex-col" key={index}>
                  {/* card heading */}
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <h2 className="text-3xl font-semibold text-muted-foreground uppercase">
                        {item.invoiceNumber}
                      </h2>
                      <p className="text-muted-foreground">
                        {txs?.[0]?.customers?.name}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 justify-between">
                      {item.paymentMode === "credit" && (
                        <div className="w-fit h-full rounded-md p-1 bg-red-400">
                          <p className="text-red-800 font-semibold">CREDIT</p>
                        </div>
                      )}
                      {item.paymentMode === "cash" && (
                        <div className="w-fit h-full rounded-md p-1 bg-green-400">
                          <p className="text-green-800 font-semibold">CASH</p>
                        </div>
                      )}
                      {item.paymentMode === "cheque" && (
                        <div className="w-fit h-full rounded-md p-1 bg-amber-400">
                          <p className="text-amber-800 font-semibold">CHEQUE</p>
                        </div>
                      )}
                      {item.paymentMode === "cash-cheque" && (
                        <div className="flex gap-2 items-center">
                          <div className="w-fit h-full rounded-md p-1 bg-green-400">
                            <p className="text-green-800 font-semibold">CASH</p>
                          </div>
                          <div className="w-fit h-full rounded-md p-1 bg-amber-400">
                            <p className="text-amber-800 font-semibold">
                              CHEQUE
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <p className="text-2xl font-semibold text-muted-foreground">
                          CASH
                        </p>
                        <p className="col-span-2 text-2xl font-semibold text-muted-foreground">
                          {formatPrice(item.totalCash)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <p className="text-2xl font-semibold text-muted-foreground">
                          AMT
                        </p>
                        <p className="col-span-2 text-2xl font-semibold text-muted-foreground">
                          {formatPrice(item.totalPrice)}
                        </p>
                      </div>

                      <div className="flex gap-1 items-center">
                        <Button
                          variant="secondary"
                          className="hover:bg-primary/50 font-bold border-primary/50 border p-2"
                        >
                          REC.PAY
                        </Button>

                        {/* payment history dialog */}
                        <PaymentHistoryDialog
                          userId={user.id}
                          item={item}
                          transaction={txs}
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
                  {txs?.map((tx, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-10 gap-5 hover:bg-primary/10 p-1"
                    >
                      <p className="col-span-2 justify-self-end">
                        {format(tx.date, "yyyy-MM-dd")}
                      </p>
                      <p className="col-span-4">{tx.products?.productNumber}</p>
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
            })
          ) : (
            <div className="mt-10 flex justify-center">
              <h2 className="text-4xl font-semibold text-muted-foreground">
                No Sales Invoices Found!
              </h2>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Invoice;
