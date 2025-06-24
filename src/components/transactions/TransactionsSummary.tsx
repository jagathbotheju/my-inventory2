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

interface Props {
  user: User;
}

const TransactionsSummary = ({ user }: Props) => {
  const { period, timeFrame } = useTimeFrameStore((state) => state);

  const { data: buyTxTotalPurchase, isLoading: buyTxTotalPurchaseLoading } =
    useByTxTotalPurchase({
      userId: user?.id,
      period,
      timeFrame,
    });
  const { data: sellTxTotalSales, isLoading: sellTxTotalSalesLoading } =
    useSellTxTotalSales({
      userId: user?.id,
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
          {/* purchase summary */}
          <p className="text-2xl font-semibold col-span-3">Total Purchase</p>
          <p className="text-2xl font-semibold col-span-3">
            {buyTxTotalPurchaseLoading ? (
              <Loader2Icon className="animate-spin w-8 h-8 text-primary" />
            ) : (
              formatPrice(totalPurchase)
            )}
          </p>

          {/* sales summary */}
          <p className="text-2xl font-semibold col-span-3">Total Sales</p>
          <p className="text-2xl font-semibold col-span-3">
            {sellTxTotalSalesLoading ? (
              <Loader2Icon className="animate-spin w-8 h-8 text-primary" />
            ) : (
              formatPrice(totalSales)
            )}
          </p>

          {/* diff */}
          <p className="col-span-3"></p>
          <p className="col-span-3"></p>
          <p className="text-2xl font-semibold col-span-3">Diff</p>
          <p className="text-2xl font-semibold col-span-3">
            {sellTxTotalSalesLoading ? (
              <Loader2Icon className="animate-spin w-8 h-8 text-primary" />
            ) : (
              formatPrice(totalSales - totalPurchase)
            )}
          </p>
        </CardContent>
      </Card>

      <TransactionsCharts user={user} />
    </div>
  );
};
export default TransactionsSummary;
