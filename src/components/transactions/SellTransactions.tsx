"use client";
import {
  useSellTransactionsPagination,
  useSellTxCount,
  useSellTxTotalSales,
} from "@/server/backend/queries/sellTxQueries";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { User } from "@/server/db/schema/users";
import { Loader2Icon, Trash2Icon } from "lucide-react";
import _ from "lodash";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import DeleteSellTxDialog from "./DeleteSellTxDialog";
import { useTimeFrameStore } from "@/store/timeFrameStore";
import { useState } from "react";
import TimeFramePicker from "../TimeFramePicker";
import Pagination from "rc-pagination";
import "rc-pagination/assets/index.css";
import { useDebounce } from "use-debounce";
import { Input } from "../ui/input";

interface Props {
  user: User;
}

const SellTransactions = ({ user }: Props) => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isError, setIsError] = useState(false);

  const [bouncedSearchTerm] = useDebounce(searchTerm, 2000);
  const { period, timeFrame } = useTimeFrameStore((state) => state);

  const { data: sellTransactions, isLoading: sellTxPaginationLoading } =
    useSellTransactionsPagination({
      userId: user.id,
      // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
      period,
      timeFrame,
      page,
      searchTerm:
        bouncedSearchTerm.length < 3 ? "" : bouncedSearchTerm.toUpperCase(),
    });
  const { data: sellTxCount } = useSellTxCount({
    userId: user.id,
    // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
    period,
    timeFrame,
  });
  const { data: totalPurchase, isLoading: sellTxTotalSalesLoading } =
    useSellTxTotalSales({
      userId: user.id,
      // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
      period,
      timeFrame,
    });

  // console.log("sellTransactions", totalPurchase);

  return (
    <div className="flex w-full flex-col">
      <Card className="flex flex-col w-full h-fit bg-transparent dark:border-primary/40">
        <CardHeader className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-4xl font-bold">
              Selling History
            </CardTitle>
            <TimeFramePicker />
          </div>

          {!searchTerm.length && (
            <div className="mt-4 flex gap-4">
              <p className="text-xl font-semibold text-muted-foreground">
                Total Sales
              </p>
              <p className="text-xl font-semibold text-muted-foreground">
                {sellTxTotalSalesLoading ? (
                  <Loader2Icon className="w-6 h-6 animate-spin" />
                ) : (
                  formatPrice(
                    totalPurchase && totalPurchase.value
                      ? parseInt(totalPurchase.value)
                      : 0
                  )
                )}
              </p>
            </div>
          )}

          {/* search */}
          <div className="pt-6 flex flex-col relative">
            <Input
              placeholder="search by invoice number..."
              value={searchTerm}
              onBlur={() => setIsError(false)}
              onFocus={() => setIsError(true)}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setSearchTerm("");
                  console.log("key down");
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
          {sellTxPaginationLoading ? (
            <div className="flex justify-center items-center">
              <Loader2Icon className="w-8 h-8 animate-spin" />
            </div>
          ) : _.isEmpty(sellTransactions) ? (
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
                  <TableHead>Customer</TableHead>
                  <TableHead>Product Number</TableHead>
                  <TableHead>Selling Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>TotalPrice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="w-full">
                {sellTransactions?.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{format(tx.date, "PPP")}</TableCell>
                    <TableCell className="uppercase">
                      {tx.invoiceNumber}
                    </TableCell>
                    <TableCell>{tx.customers.name}</TableCell>
                    <TableCell>{tx.products.productNumber}</TableCell>
                    <TableCell>{formatPrice(tx.unitPrice ?? 0)}</TableCell>
                    <TableCell>{tx.quantity}</TableCell>
                    <TableCell>
                      {formatPrice(tx.quantity * (tx.unitPrice ?? 0))}
                    </TableCell>

                    {/* delete */}
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <DeleteSellTxDialog userId={user.id} tx={tx}>
                            <TooltipTrigger asChild>
                              <Trash2Icon className="w-5 h-5 text-red-500 cursor-pointer" />
                            </TooltipTrigger>
                          </DeleteSellTxDialog>
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

      {sellTransactions?.length && !searchTerm.length ? (
        <div className="self-end mt-6">
          <Pagination
            pageSize={10}
            onChange={(current) => {
              setPage(current);
            }}
            style={{ color: "red" }}
            current={page}
            total={sellTxCount?.count}
            showPrevNextJumpers
            showTitle={false}
          />
        </div>
      ) : null}
    </div>
  );
};
export default SellTransactions;
