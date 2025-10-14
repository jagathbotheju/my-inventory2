"use client";
import { User } from "@/server/db/schema/users";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useAllUserStocks } from "@/server/backend/queries/stockQueries";
import _ from "lodash";
import { useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import { Input } from "../ui/input";
import { Loader2Icon } from "lucide-react";
import StockCard from "./StockCard";
import { formatPrice } from "@/lib/utils";

interface Props {
  user: User;
}

const Stocks = ({ user }: Props) => {
  const [isError, setIsError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [bouncedSearchTerm] = useDebounce(searchTerm, 1000);

  const { data: allUserStocks, isLoading: allStockLoading } = useAllUserStocks({
    userId: user?.id as string,
    // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
    searchTerm: bouncedSearchTerm.length < 3 ? "" : bouncedSearchTerm,
  });

  const allStockAmount = useMemo(() => {
    return allUserStocks?.reduce((acc, item) => {
      if (item.sellTxTotalQuantity < item.buyTxTotalQuantity) {
        return (acc += item.buyTxTotalAmount - item.sellTxTotalAmount);
      }
      return acc;
    }, 0);
  }, [allUserStocks]);

  return (
    <Card className="flex flex-col w-full h-fit bg-transparent dark:border-primary/40">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-4xl font-bold flex gap-1 flex-col">
            <div className="flex">
              {searchTerm.length ? (
                <p>Searching Stocks...</p>
              ) : (
                <p className="text-2xl font-semibold text-muted-foreground">
                  Stock Value {formatPrice(allStockAmount ?? 0)}
                </p>
              )}
            </div>
          </CardTitle>
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
      <CardContent className="gap-5 grid grid-cols-3">
        {allStockLoading ? (
          <div className="flex w-full p-8 items-center justify-center col-span-3">
            <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : allUserStocks && allUserStocks?.length > 0 ? (
          _.sortBy(allUserStocks, "productNumber")?.map((stock, index) => (
            <StockCard stock={stock} key={index} />
          ))
        ) : (
          allUserStocks?.length === 0 && (
            <div className="flex w-full items-center justify-center col-span-3 mt-10">
              <p className="text-3xl text-muted-foreground col-span-3 font-semibold">
                No stocks found!
              </p>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
};

export default Stocks;
