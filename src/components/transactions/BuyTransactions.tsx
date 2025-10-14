"use client";
import { User } from "@/server/db/schema/users";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  useBuyTransactionsPagination,
  useBuyTxCount,
  useByTxTotalPurchase,
} from "@/server/backend/queries/buyTxQueries";
import _ from "lodash";
import { Loader2Icon, Trash2Icon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { format } from "date-fns";
import { formatPrice } from "@/lib/utils";
import DeleteBuyTxDialog from "./DeleteBuyTxDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useTimeFrameStore } from "@/store/timeFrameStore";
import TimeFramePicker from "../TimeFramePicker";
import { useState } from "react";
import Pagination from "rc-pagination";
import "rc-pagination/assets/index.css";
import { useDebounce } from "use-debounce";
import { Input } from "../ui/input";

interface Props {
  user: User;
}

const BuyTransactions = ({ user }: Props) => {
  const [isError, setIsError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [bouncedSearchTerm] = useDebounce(searchTerm, 1000);
  const [page, setPage] = useState(1);
  const { period, timeFrame } = useTimeFrameStore((state) => state);

  const { data: buyTransactions, isLoading } = useBuyTransactionsPagination({
    userId: user.id,
    // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
    period,
    timeFrame,
    page,
    searchTerm:
      bouncedSearchTerm.length < 3 ? "" : bouncedSearchTerm.toUpperCase(),
  });

  //---buyTransactions-count---
  const { data: buyTxCount } = useBuyTxCount({
    userId: user.id,
    // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
    period,
    timeFrame,
    searchTerm,
  });

  const { data: totalPurchase } = useByTxTotalPurchase({
    userId: user.id,
    // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
    period,
    timeFrame,
    searchTerm,
  });

  return (
    <div className="flex w-full flex-col">
      <Card className="flex flex-col w-full h-fit bg-transparent dark:border-primary/40">
        <CardHeader className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-4xl font-bold">
              {searchTerm.length ? "Searching Buy History..." : "Buy History"}
            </CardTitle>
            {!searchTerm.length && <TimeFramePicker />}
          </div>

          {!searchTerm.length && (
            <div className="mt-4 flex gap-4">
              <p className="text-xl font-semibold text-muted-foreground">
                Total Purchase
              </p>
              <p className="text-xl font-semibold text-muted-foreground">
                {formatPrice(
                  totalPurchase && totalPurchase.value
                    ? parseFloat(totalPurchase.value)
                    : 0
                )}
              </p>
            </div>
          )}

          {/* search */}
          <div className="pt-6 flex flex-col relative">
            <Input
              className="uppercase"
              placeholder="search by invoice or product number..."
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
          {isLoading ? (
            <div className="flex justify-center items-center">
              <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : _.isEmpty(buyTransactions) ? (
            <div className="mt-8 flex justify-center items-center">
              <h1 className="font-bold text-3xl text-muted-foreground">
                No Transactions Found!
              </h1>
            </div>
          ) : (
            <Table className="text-[1.1rem] w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Product Number</TableHead>
                  <TableHead>Purchased Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>TotalPrice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="w-full">
                {buyTransactions?.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{format(tx.date, "PPP")}</TableCell>
                    <TableCell className="uppercase">
                      {tx.buyTxInvoices.invoiceNumber}
                    </TableCell>
                    <TableCell>{tx.products.suppliers.name}</TableCell>
                    <TableCell className="uppercase">
                      {tx.products.productNumber}
                    </TableCell>
                    <TableCell>{formatPrice(tx.unitPrice ?? 0)}</TableCell>
                    <TableCell>{tx.quantity}</TableCell>
                    <TableCell>
                      {formatPrice(tx.quantity * (tx.unitPrice ?? 0))}
                    </TableCell>

                    {/* delete */}
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <DeleteBuyTxDialog userId={user.id} tx={tx}>
                            <TooltipTrigger asChild>
                              <Trash2Icon className="w-5 h-5 text-red-500 cursor-pointer" />
                            </TooltipTrigger>
                          </DeleteBuyTxDialog>
                          <TooltipContent>
                            <p className="text-sm">delete transaction</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {buyTransactions?.length && !searchTerm.length ? (
        <div className="self-end mt-6">
          <Pagination
            pageSize={10}
            onChange={(current) => {
              setPage(current);
            }}
            style={{ color: "red" }}
            current={page}
            total={buyTxCount?.count}
            showPrevNextJumpers
            showTitle={false}
          />
        </div>
      ) : null}
    </div>
  );
};
export default BuyTransactions;
