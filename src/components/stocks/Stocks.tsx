"use client";
import { User } from "@/server/db/schema/users";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  useAllUserStocksByPeriod,
  useSearchStocks,
} from "@/server/backend/queries/stockQueries";
import { format } from "date-fns";
import _ from "lodash";
import Link from "next/link";
import TimeFramePicker from "../TimeFramePicker";
import { useTimeFrameStore } from "@/store/timeFrameStore";
import { Button } from "../ui/button";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import { Input } from "../ui/input";

interface Props {
  user: User;
}

const Stocks = ({ user }: Props) => {
  const { period, timeFrame } = useTimeFrameStore((state) => state);
  const [allStocks, setAllStocks] = useState(true);
  const [isError, setIsError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [bouncedSearchTerm] = useDebounce(searchTerm, 1000);

  // const { data: allUserStocks } = useAllUserStocks(user?.id as string);
  const { data: allUserStocks } = useAllUserStocksByPeriod({
    userId: user?.id as string,
    // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7", // For testing purposes
    period: period,
    timeFrame: allStocks ? "all" : timeFrame,
    searchTerm: bouncedSearchTerm.length < 3 ? "" : bouncedSearchTerm,
  });

  const { data: searchStocks } = useSearchStocks({
    userId: user?.id as string,
    // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7", // For testing purposes
    searchTerm: bouncedSearchTerm,
  });

  // console.log("allStocks", allUserStocks);
  // console.log("searchStocks", searchStocks);

  return (
    <Card className="flex flex-col w-full h-fit bg-transparent dark:border-primary/40">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-4xl font-bold flex gap-1">
            {searchTerm.length ? (
              <p>Searching Stocks...</p>
            ) : (
              <p>Stock Balance</p>
            )}
            {allStocks && !searchTerm.length && (
              <p>,{format(new Date(), "yyyy-MM-dd")}</p>
            )}
          </CardTitle>

          {!searchTerm.length && (
            <div className="flex items-center gap-2">
              {!allStocks && <TimeFramePicker />}
              <Button
                className="font-semibold"
                onClick={() => setAllStocks(!allStocks)}
              >
                {allStocks ? "Stocks by Period" : "All Stocks"}
              </Button>
            </div>
          )}
        </div>

        {/* search */}
        <div className="pt-6 flex flex-col relative">
          <Input
            className="uppercase"
            placeholder="search by product number..."
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
      <CardContent className="gap-5 grid grid-cols-3">
        {searchTerm.length && searchStocks && searchStocks?.length > 0
          ? _.sortBy(searchStocks, "productNumber")?.map((stock, index) => (
              <Link
                href={`/stocks/${stock.productId}?stockBal=${stock.quantity}`}
                key={index}
                className="flex flex-col items-center col-span-1 rounded-md border-primary border"
              >
                <div className="bg-primary/30 p-2 text-xl w-full font-semibold uppercase">
                  {stock.productNumber}
                </div>
                {/* <div>{stock.productId}</div> */}
                <div className="p-2 text-xl font-semibold w-full text-center">
                  {stock.quantity}
                </div>
              </Link>
            ))
          : searchTerm.length === 0 &&
            allUserStocks &&
            allUserStocks?.length > 0
          ? _.sortBy(allUserStocks, "productNumber")?.map((stock, index) => (
              <Link
                href={`/stocks/${stock.productId}?stockBal=${stock.quantity}`}
                key={index}
                className="flex flex-col items-center col-span-1 rounded-md border-primary border"
              >
                <div className="bg-primary/30 p-2 text-xl w-full font-semibold uppercase">
                  {stock.productNumber}
                </div>
                {/* <div>{stock.productId}</div> */}
                <div className="p-2 text-xl font-semibold w-full text-center">
                  {stock.quantity}
                </div>
              </Link>
            ))
          : allUserStocks?.length === 0 ||
            (searchStocks?.length === 0 && (
              <div className="flex w-full items-center justify-center col-span-3 mt-10">
                <p className="text-3xl text-muted-foreground col-span-3 font-semibold">
                  No stocks found for this period.
                </p>
              </div>
            ))}
      </CardContent>
    </Card>
  );
};

export default Stocks;
