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
import {
  useSearchSellTxInvoices,
  useSellTxInvoicesForPeriod,
} from "@/server/backend/queries/invoiceQueries";
import { useDebounce } from "use-debounce";
import { Input } from "../ui/input";
import { Loader2 } from "lucide-react";
import InvoiceCard from "./InvoiceCard";

interface Props {
  user: User;
}

const Invoice = ({ user }: Props) => {
  const [isError, setIsError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [bouncedSearchTerm] = useDebounce(searchTerm, 1000);
  const [isBuyTx, setIsBuyTx] = useState(false);
  const { period, timeFrame } = useTimeFrameStore((state) => state);

  //buy txs
  const { data: buyTxs, isLoading: isLoadingBuyTx } = useBuyTxByUserByPeriod({
    userId: user.id,
    // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
    period,
    timeFrame,
    searchTerm:
      bouncedSearchTerm.length < 3 ? "" : bouncedSearchTerm.toUpperCase(),
    isBuyTx,
  });

  //search buy txs
  // const { data: searchBuyTxInvoices } = useSearchBuyTxInvoices({
  //   // userId: user?.id as string,
  //   userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7", // For testing purposes
  //   searchTerm: bouncedSearchTerm,
  //   isSellTx: !isBuyTx,
  // });

  //sell tx invoices
  const { data: sellTxInvoices, isLoading: isLoadingSellTx } =
    useSellTxInvoicesForPeriod({
      userId: user.id,
      // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
      period,
      timeFrame,
      isSellTx: !isBuyTx,
      searchTerm: bouncedSearchTerm,
    });

  //search sell tx invoices
  const { data: searchSellTxInvoices } = useSearchSellTxInvoices({
    userId: user?.id as string,
    // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7", // For testing purposes
    searchTerm: bouncedSearchTerm,
    isSellTx: !isBuyTx,
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
                {isBuyTx
                  ? "Buy Invoices "
                  : searchTerm.length
                  ? "Searching Sell Invoices..."
                  : " Sell Invoices "}
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

            {searchTerm.length === 0 && (
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
            )}
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
          {searchTerm.length ? (
            <p
              className="text-xl text-muted-foreground font-semibold absolute right-3 top-[26px] p-1 cursor-pointer"
              onClick={() => setSearchTerm("")}
            >
              X
            </p>
          ) : null}
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
            isLoadingBuyTx ? (
              <div className="flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
          ) : isLoadingSellTx ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : searchSellTxInvoices?.length ? (
            searchSellTxInvoices?.map((item, index) => (
              <InvoiceCard key={index} user={user} item={item} />
            ))
          ) : searchTerm.length === 0 && sellTxInvoices?.length ? (
            sellTxInvoices?.map((item, index) => (
              <InvoiceCard key={index} user={user} item={item} />
            ))
          ) : (
            !isLoadingSellTx && (
              <div className="mt-10 flex justify-center">
                <h2 className="text-4xl font-semibold text-muted-foreground">
                  No Sales Invoices Found!
                </h2>
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Invoice;
