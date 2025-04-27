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

interface Props {
  user: User;
}

const PurchaseInvoice = ({ user }: Props) => {
  const { period, timeFrame } = useTimeFrameStore((state) => state);
  const { data: buyTxs } = useBuyTxByUserByPeriod({
    userId: user.id,
    // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
    period,
    timeFrame,
  });

  const { data: totalPurchase } = useByTxTotalPurchase({
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

  // console.log("invoices", buyTxs);

  return (
    <Card className="dark:bg-transparent dark:border-primary/40">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-4xl font-bold">
            <div className="flex gap-4 items-center">
              <p>Invoices</p>
              {totalPurchase?.value && (
                <p className="font-semibold text-muted-foreground">
                  {formatPrice(
                    totalPurchase && totalPurchase.value
                      ? parseFloat(totalPurchase.value)
                      : 0
                  )}
                </p>
              )}
            </div>
          </CardTitle>
          <TimeFramePicker />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col w-full gap-y-10">
          {filteredBuyTxs?.map((item, index) => {
            const txs = buyTxs?.filter(
              (x) => x.invoiceNumber === item.invoiceNumber
            );
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
                  <div key={index} className="grid grid-cols-10 gap-5">
                    <p className="col-span-2 justify-self-end">
                      {format(tx.date, "yyyy-MM-dd")}
                    </p>
                    <p className="col-span-4">{tx.productNumber}</p>
                    <p className="col-span-2">
                      {formatPrice(tx.quantity * tx.unitPrice)}
                    </p>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default PurchaseInvoice;
