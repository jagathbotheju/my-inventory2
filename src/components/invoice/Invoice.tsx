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
import PaymentHistoryDialog from "../PaymentHistoryDialog";
import PaymentAddDialog from "../PaymentAddDialog";
// import { useDebounce } from "@/hooks/useDebounce";
import { useDebounce } from "use-debounce";
import { Input } from "../ui/input";
import { Loader2 } from "lucide-react";

interface Props {
  user: User;
}

const Invoice = ({ user }: Props) => {
  const [isError, setIsError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [bouncedSearchTerm] = useDebounce(searchTerm, 2000);
  const [isBuyTx, setIsBuyTx] = useState(true);
  const { period, timeFrame } = useTimeFrameStore((state) => state);

  const { data: buyTxs } = useBuyTxByUserByPeriod({
    userId: user.id,
    // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
    period,
    timeFrame,
    searchTerm:
      bouncedSearchTerm.length < 3 ? "" : bouncedSearchTerm.toUpperCase(),
    isBuyTx,
  });

  const { data: sellTxInvoices, isLoading } = useSellTxInvoicesForPeriod({
    userId: user.id,
    // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
    period,
    timeFrame,
    isSellTx: !isBuyTx,
    searchTerm:
      bouncedSearchTerm.length < 3 ? "" : bouncedSearchTerm.toUpperCase(),
  });

  const { data: totalPurchase } = useByTxTotalPurchase({
    userId: user.id,
    // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
    period,
    timeFrame,
    searchTerm,
  });

  const { data: totalSales } = useSellTxTotalSales({
    userId: user.id,
    // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
    period,
    timeFrame,
    searchTerm,
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
                {isBuyTx ? "Buy Invoices " : "Sell Invoices "}
              </p>
              {isBuyTx && !searchTerm.length
                ? totalPurchase?.value && (
                    <p className="font-semibold text-muted-foreground text-3xl">
                      {formatPrice(
                        totalPurchase && totalPurchase.value
                          ? parseFloat(totalPurchase.value)
                          : 0
                      )}
                    </p>
                  )
                : totalSales?.value &&
                  !searchTerm.length && (
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
                  className={`tracking-widest border-primary hover:bg-primary/80`}
                  variant={isBuyTx ? "default" : "outline"}
                  onClick={() => setIsBuyTx(true)}
                >
                  BUY
                </Button>
                <Button
                  size="sm"
                  className={`tracking-widest border-primary hover:bg-primary/80`}
                  variant={!isBuyTx ? "default" : "outline"}
                  onClick={() => setIsBuyTx(false)}
                >
                  SELL
                </Button>
              </div>
            </div>
          </div>
        </CardTitle>

        {/* search */}
        <div className="pt-6 flex flex-col relative">
          <Input
            className="uppercase"
            placeholder="search invoice..."
            value={searchTerm}
            onBlur={() => setIsError(false)}
            onFocus={() => setIsError(true)}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setSearchTerm("");
              }
            }}
          />
          <p
            className="text-xl text-muted-foreground font-semibold absolute right-3 top-[26px] p-1 cursor-pointer"
            onClick={() => setSearchTerm("")}
          >
            X
          </p>
          {isError && searchTerm.length < 3 && searchTerm.length !== 0 && (
            <p className="text-sm text-red-500">
              please type at least 3 characters
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col w-full gap-y-10 mt-8">
          {/* buyTransactions */}
          {isBuyTx ? (
            isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : filteredBuyTxs?.length ? (
              filteredBuyTxs?.map((item, index) => {
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
            ) // sellTransactions
          ) : isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : sellTxInvoices?.length ? (
            sellTxInvoices?.map((item, index) => {
              const totalAmount = item.sellTransactions.reduce(
                (acc, tx) => (acc += (tx.unitPrice ?? 0) * tx.quantity),
                0
              );
              return (
                <div className="flex flex-col py-4" key={index}>
                  {/* card heading */}
                  <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                    <div className="flex flex-col">
                      <h2 className="text-3xl font-semibold uppercase">
                        {item.invoiceNumber}
                      </h2>
                      <p className="">
                        {item.sellTransactions[0]?.customers?.name}
                      </p>
                    </div>

                    {/* received Amount */}
                    <div className="flex items-center gap-4 justify-between">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1">
                          <p className="text-xl font-semibold">
                            Received Amount
                          </p>
                          <p className="col-span-2 text-xl font-semibold">
                            {formatPrice(item.totalCash ?? 0)}
                          </p>
                        </div>

                        {/* totalAmount */}
                        <div className="flex items-center gap-1">
                          <p className="">Total Amount</p>
                          <p className="col-span-2">
                            {formatPrice(totalAmount)}
                          </p>
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
