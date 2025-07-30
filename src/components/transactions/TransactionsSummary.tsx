"use client";

import Link from "next/link";
import TimeFramePicker from "../TimeFramePicker";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useTimeFrameStore } from "@/store/timeFrameStore";
import { useByTxTotalPurchase } from "@/server/backend/queries/buyTxQueries";
import { User } from "@/server/db/schema/users";
import { formatPrice } from "@/lib/utils";
import { Loader2Icon } from "lucide-react";
import { useSellTxTotalSales } from "@/server/backend/queries/sellTxQueries";
import TransactionsCharts from "./TransactionsCharts";
import { useTotalExpenses } from "@/server/backend/queries/expenseQueries";

interface Props {
  user: User;
}

const TransactionsSummary = ({ user }: Props) => {
  const { period, timeFrame } = useTimeFrameStore((state) => state);

  const { data: buyTxTotalPurchase, isLoading: buyTxTotalPurchaseLoading } =
    useByTxTotalPurchase({
      userId: user?.id,
      // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
      period,
      timeFrame,
    });
  const { data: sellTxTotalSales, isLoading: sellTxTotalSalesLoading } =
    useSellTxTotalSales({
      userId: user?.id,
      // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
      period,
      timeFrame,
    });
  const { data: totalExpenses, isLoading: totalExpensesLoading } =
    useTotalExpenses({
      userId: user.id,
      period,
      timeFrame,
    });

  const totalPurchase =
    buyTxTotalPurchase && buyTxTotalPurchase.value
      ? parseInt(buyTxTotalPurchase.value)
      : 0;
  const totalSales =
    sellTxTotalSales && sellTxTotalSales.value
      ? parseInt(sellTxTotalSales.value)
      : 0;

  return (
    <div className="flex w-full flex-col gap-10">
      <Card className="flex flex-col w-full h-fit bg-transparent dark:border-primary/40">
        <CardHeader className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-4xl font-bold">Sales Summary</CardTitle>
            <TimeFramePicker />

            <div className="flex gap-2 items-center">
              <Button asChild>
                <Link className="font-semibold" href="/transactions/buy">
                  Buy
                </Link>
              </Button>
              <Button asChild>
                <Link className="font-semibold" href="/transactions/sell">
                  Sell
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="w-full grid grid-cols-12 mt-6 gap-4">
          {buyTxTotalPurchaseLoading ||
          sellTxTotalSalesLoading ||
          totalExpensesLoading ? (
            <div className="col-span-12">
              <div className="w-full flex items-center justify-center">
                <Loader2Icon className="animate-spin w-8 h-8 text-primary" />
              </div>
            </div>
          ) : (
            <>
              {/* purchase summary */}
              <p className="text-2xl font-semibold col-span-3">
                Total Purchase
              </p>
              <p className="text-2xl font-semibold col-span-3">
                {formatPrice(totalPurchase)}
              </p>

              {/* sales summary */}
              <p className="text-2xl font-semibold col-span-3">Total Sales</p>
              <p className="text-2xl font-semibold col-span-3">
                {formatPrice(totalSales)}
              </p>

              <p className="col-span-3 text-2xl font-semibold">
                Total Expenses
              </p>
              <p className="col-span-3 text-2xl font-semibold">
                {totalExpenses ? formatPrice(+totalExpenses) : 0}
              </p>

              {/* profit */}
              <p className="text-2xl font-semibold col-span-3">Profit</p>
              <p className="text-2xl font-semibold col-span-3">
                {formatPrice(totalSales - totalPurchase)}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <TransactionsCharts user={user} />
    </div>
  );
};
export default TransactionsSummary;
