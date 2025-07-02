"use client";
import { User } from "@/server/db/schema/users";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import TimeFramePicker from "../TimeFramePicker";
import { useTimeFrameStore } from "@/store/timeFrameStore";
import { useByTxTotalPurchase } from "@/server/backend/queries/buyTxQueries";
import { formatPrice } from "@/lib/utils";
import { Button } from "../ui/button";
import { useState } from "react";
import { useSellTxTotalSales } from "@/server/backend/queries/sellTxQueries";
import {
  useBuyTxInvoicesForPeriod,
  useSearchBuyTxInvoices,
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

  //BuyTx Invoices Period
  const { data: buyTxInvoices, isLoading: isLoadingBuyTx } =
    useBuyTxInvoicesForPeriod({
      userId: user.id,
      // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
      period,
      timeFrame,
      isBuyTx,
      searchTerm: bouncedSearchTerm,
    });

  //Search BuyTxs Invoices
  const { data: searchBuyTxInvoices, isLoading: isLoadingSearchBuyTx } =
    useSearchBuyTxInvoices({
      userId: user?.id as string,
      // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7", // For testing purposes
      searchTerm: bouncedSearchTerm,
      isBuyTx,
    });

  //SellTx Invoices Period
  const { data: sellTxInvoices, isLoading: isLoadingSellTx } =
    useSellTxInvoicesForPeriod({
      userId: user.id,
      // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
      period,
      timeFrame,
      isSellTx: !isBuyTx,
      searchTerm: bouncedSearchTerm,
    });

  //Search SellTx invoices
  const { data: searchSellTxInvoices, isLoading: isLoadingSearchSellTx } =
    useSearchSellTxInvoices({
      userId: user?.id as string,
      // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7", // For testing purposes
      searchTerm: bouncedSearchTerm,
      isSellTx: !isBuyTx,
    });

  //Total Purchase
  const { data: totalPurchase } = useByTxTotalPurchase({
    userId: user.id,
    // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
    period,
    timeFrame,
    searchTerm,
  });

  //Total Sales
  const { data: totalSales } = useSellTxTotalSales({
    userId: user.id,
    // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
    period,
    timeFrame,
    searchTerm,
  });

  return (
    <Card className="dark:bg-transparent dark:border-primary/40">
      <CardHeader>
        <CardTitle className="text-4xl font-bold">
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <p className="text-3xl">
                {isBuyTx
                  ? searchTerm.length
                    ? "Searching Buy Invoices..."
                    : "Buy Invoices"
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
              <div className="flex gap-5 items-center self-end">
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
        <div className="pt-4 flex flex-col relative">
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
              className="text-xl text-muted-foreground font-semibold absolute right-3 top-[18px] p-1 cursor-pointer"
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
            isLoadingBuyTx || isLoadingSearchBuyTx ? (
              <div className="flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : searchBuyTxInvoices?.length ? (
              searchBuyTxInvoices?.map((item, index) => (
                <InvoiceCard
                  key={index}
                  user={user}
                  buyTxInvoice={item}
                  isBuyTx
                />
              ))
            ) : searchTerm.length === 0 && buyTxInvoices?.length ? (
              buyTxInvoices?.map((item, index) => (
                <InvoiceCard
                  key={index}
                  user={user}
                  buyTxInvoice={item}
                  isBuyTx
                />
              ))
            ) : (
              !isLoadingBuyTx ||
              (!isLoadingSearchBuyTx && (
                <div className="mt-10 flex justify-center">
                  <h2 className="text-4xl font-semibold text-muted-foreground">
                    No Buy Invoices Found!
                  </h2>
                </div>
              ))
            )
          ) : // sellTransactions
          isLoadingSellTx || isLoadingSearchSellTx ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : searchSellTxInvoices?.length ? (
            searchSellTxInvoices?.map((item, index) => (
              <InvoiceCard key={index} user={user} sellTxInvoice={item} />
            ))
          ) : searchTerm.length === 0 && sellTxInvoices?.length ? (
            sellTxInvoices?.map((item, index) => (
              <InvoiceCard key={index} user={user} sellTxInvoice={item} />
            ))
          ) : (
            !isLoadingSellTx ||
            (!isLoadingSearchSellTx && (
              <div className="mt-10 flex justify-center">
                <h2 className="text-4xl font-semibold text-muted-foreground">
                  No Sell Invoices Found!
                </h2>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Invoice;
