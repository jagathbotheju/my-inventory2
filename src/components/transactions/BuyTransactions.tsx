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

interface Props {
  user: User;
}

const BuyTransactions = ({ user }: Props) => {
  const [page, setPage] = useState(1);
  const { period, timeFrame } = useTimeFrameStore((state) => state);
  const { data: buyTransactions, isLoading } = useBuyTransactionsPagination({
    userId: user.id,
    period,
    timeFrame,
    page,
  });
  const { data: buyTxCount } = useBuyTxCount({
    userId: user.id,
    period,
    timeFrame,
  });
  const { data: totalPurchase } = useByTxTotalPurchase({
    userId: user.id,
    period,
    timeFrame,
  });

  // console.log("buyTransactions", buyTransactions);

  return (
    <div className="flex w-full flex-col">
      <Card className="flex flex-col w-full h-fit bg-transparent dark:border-primary/40">
        <CardHeader className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-4xl font-bold">Buying History</CardTitle>
            <TimeFramePicker />
          </div>

          <div className="mt-4 flex gap-4">
            <p className="text-xl font-semibold text-muted-foreground">
              Total Purchase
            </p>
            <p className="text-xl font-semibold text-muted-foreground">
              {formatPrice(
                totalPurchase && totalPurchase.value
                  ? parseInt(totalPurchase.value)
                  : 0
              )}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center">
              <Loader2Icon className="w-8 h-8 animate-spin" />
            </div>
          ) : _.isEmpty(buyTransactions) ? (
            <div className="mt-8 flex justify-center items-center">
              <h1 className="font-bold text-3xl text-muted-foreground">
                No Transactions Found!
              </h1>
            </div>
          ) : (
            <Table className="text-lg w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Product Number</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>TotalPrice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="w-full">
                {buyTransactions?.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{format(tx.date, "PPP")}</TableCell>
                    <TableCell>{tx.suppliers.name}</TableCell>
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

      {buyTransactions?.length && (
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
      )}
    </div>
  );
};
export default BuyTransactions;
