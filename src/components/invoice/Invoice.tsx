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
  useBuyTxInvoicesCount,
  useBuyTxInvoicesForPeriodPagination,
  useSellTxInvoicesCount,
  useSellTxInvoicesForPeriodPagination,
} from "@/server/backend/queries/invoiceQueries";
import { useDebounce } from "use-debounce";
import { Input } from "../ui/input";
import { Loader2 } from "lucide-react";
import InvoiceCard from "./InvoiceCard";
import Pagination from "rc-pagination";

interface Props {
  user: User;
}

const Invoice = ({ user }: Props) => {
  const [page, setPage] = useState(1);
  const [isError, setIsError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [bouncedSearchTerm] = useDebounce(searchTerm, 1000);
  const [isBuyTx, setIsBuyTx] = useState(true);
  const { period, timeFrame } = useTimeFrameStore((state) => state);

  //---BuyTxInvoices-Period-pagination---
  const { data: buyTxInvoices, isLoading: isLoadingBuyTxInvoices } =
    useBuyTxInvoicesForPeriodPagination({
      userId: user.id,
      // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
      period,
      timeFrame,
      isBuyTx,
      page,
      searchTerm: bouncedSearchTerm,
    });

  //---SellTxInvoices-Period-pagination---
  const { data: sellTxInvoices, isLoading: isLoadingSellTxInvoices } =
    useSellTxInvoicesForPeriodPagination({
      userId: user.id,
      // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
      period,
      timeFrame,
      isBuyTx,
      page,
      searchTerm: bouncedSearchTerm,
    });

  //---buyTx-Total-Purchase---
  const { data: totalPurchase } = useByTxTotalPurchase({
    userId: user.id,
    // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
    period,
    timeFrame,
    searchTerm,
  });

  //---sellTx-Total-Sales---
  const { data: totalSales } = useSellTxTotalSales({
    userId: user.id,
    // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
    period,
    timeFrame,
    searchTerm,
  });

  //---buyTxInvoices-count---
  const { data: buyTxInvoicesCount } = useBuyTxInvoicesCount({
    userId: user.id,
    // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
    period,
    timeFrame,
    searchTerm,
  });

  //---sellTxInvoices-count---
  const { data: sellTxInvoicesCount } = useSellTxInvoicesCount({
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
          {isLoadingBuyTxInvoices || isLoadingSellTxInvoices ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : isBuyTx ? (
            buyTxInvoices?.map((item, index) => (
              <InvoiceCard
                key={index}
                user={user}
                buyTxInvoice={item}
                isBuyTx={isBuyTx}
              />
            ))
          ) : (
            sellTxInvoices?.map((item, index) => (
              <InvoiceCard
                key={index}
                user={user}
                sellTxInvoice={item}
                isBuyTx={isBuyTx}
              />
            ))
          )}

          {(isBuyTx && !buyTxInvoices?.length) ||
            (!sellTxInvoices?.length && !isBuyTx && (
              <div className="self-center">
                <h2 className="text-3xl font-bold text-muted-foreground">
                  No Transactions Found!
                </h2>
              </div>
            ))}

          {!searchTerm.length &&
          ((isBuyTx && buyTxInvoices?.length) ||
            (!isBuyTx && sellTxInvoices?.length)) ? (
            <div className="self-end mt-6">
              <Pagination
                pageSize={10}
                onChange={(current) => {
                  setPage(current);
                }}
                style={{ color: "red" }}
                current={page}
                total={
                  isBuyTx
                    ? buyTxInvoicesCount?.count
                    : sellTxInvoicesCount?.count
                }
                showPrevNextJumpers
                showTitle={false}
              />
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

export default Invoice;
