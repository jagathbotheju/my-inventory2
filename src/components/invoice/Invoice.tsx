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
import { useSellTxTotalSales } from "@/server/backend/queries/sellTxQueries";
import { useSellTxInvoicesForPeriod } from "@/server/backend/queries/invoiceQueries";

interface Props {
  user: User;
}

const Invoice = ({ user }: Props) => {
  const [isBuyTx, setIsBuyTx] = useState(true);
  const { period, timeFrame } = useTimeFrameStore((state) => state);
  const { data: buyTxs } = useBuyTxByUserByPeriod({
    userId: user.id,
    // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
    period,
    timeFrame,
  });

  const { data: sellTxInvoices } = useSellTxInvoicesForPeriod({
    userId: user.id,
    // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
    period,
    timeFrame,
  });
  // console.log("sellTxInvoices", sellTxInvoices);

  const { data: totalPurchase } = useByTxTotalPurchase({
    userId: user.id,
    // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
    period,
    timeFrame,
  });

  const { data: totalSales } = useSellTxTotalSales({
    userId: user.id,
    // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
    period,
    timeFrame,
  });

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

  return (
    <Card className="dark:bg-transparent dark:border-primary/40">
      <CardHeader>
        <CardTitle className="text-4xl font-bold">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center gap-1">
              <p className="text-3xl">
                {isBuyTx ? "Buy Invoices," : "Sell Invoices,"}
              </p>
              {isBuyTx
                ? totalPurchase?.value && (
                    <p className="font-semibold text-muted-foreground text-3xl">
                      {formatPrice(
                        totalPurchase && totalPurchase.value
                          ? parseFloat(totalPurchase.value)
                          : 0
                      )}
                    </p>
                  )
                : totalSales?.value && (
                    <p className="font-semibold text-muted-foreground text-3xl">
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
                // console.log("transactions", txs);
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
          sellTxInvoices?.length ? (
            sellTxInvoices?.map((item, index) => {
              const totalAmount = item.sellTransactions.reduce(
                (acc, tx) => (acc += (tx.unitPrice ?? 0) * tx.quantity),
                0
              );
              return (
                <div className="flex flex-col" key={index}>
                  {/* card heading */}
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <h2 className="text-3xl font-semibold text-muted-foreground uppercase">
                        {item.invoiceNumber}
                      </h2>
                      <p className="text-muted-foreground">
                        {item.sellTransactions[0]?.customers?.name}
                      </p>
                    </div>

                    {/* received Amount */}
                    <div className="flex items-center gap-4 justify-between">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1">
                          <p className="text-xl font-semibold text-muted-foreground">
                            Received Amount
                          </p>
                          <p className="col-span-2 text-xl font-semibold text-muted-foreground">
                            {formatPrice(item.totalCash ?? 0)}
                          </p>
                        </div>

                        {/* totalAmount */}
                        <div className="flex items-center gap-1">
                          <p className="text-muted-foreground">Total Amount</p>
                          <p className="col-span-2 text-muted-foreground">
                            {formatPrice(totalAmount)}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-1 items-center">
                        <Button
                          variant="secondary"
                          className="hover:bg-primary/50 font-bold border-primary/50 border p-2"
                        >
                          REC.PAY
                        </Button>

                        {/* payment history dialog */}
                        {/* <PaymentHistoryDialog
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
                        </PaymentHistoryDialog> */}
                      </div>
                    </div>
                  </div>
                  <Separator className="bg-primary/20 mb-2" />
                  {item.sellTransactions.map((tx, index) => (
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
