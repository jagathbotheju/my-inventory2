"use client";

import { useDailyBuyTransactions } from "@/server/backend/queries/buyTxQueries";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { formatPrice } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useDailySellTransactions } from "@/server/backend/queries/sellTxQueries";

interface Props {
  userId: string;
}

const DailyTransactions = ({ userId }: Props) => {
  const searchParams = useSearchParams();
  const date = searchParams.get("date");
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const buyDate = new Date(`${year}-${month}-${date}`).toISOString();
  const dateStr = format(buyDate, "yyyy-MM-dd HH:mm:ss");

  const { data: dailyBuyTransactions } = useDailyBuyTransactions({
    buyDate: dateStr,
    userId,
  });
  const { data: dailySellTransactions } = useDailySellTransactions({
    sellDate: dateStr,
    userId,
  });

  const totalExpenses =
    dailyBuyTransactions?.reduce((acc, tx) => {
      return acc + tx.quantity * (tx.unitPrice ?? 0);
    }, 0) ?? 0;
  const totalSales =
    dailySellTransactions?.reduce((acc, tx) => {
      return acc + tx.quantity * (tx.unitPrice ?? 0);
    }, 0) ?? 0;

  return (
    <div className="flex w-full flex-col">
      <Card className="flex flex-col w-full h-fit bg-transparent dark:border-primary/40">
        <CardHeader className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-4xl font-bold">Daily Sales</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex w-full gap-6">
            {/* buy history */}
            <div className="flex flex-col flex-1">
              <h3 className="text-2xl font-semibold">Purchases</h3>

              <Table className="text-lg w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="w-full">
                  {dailyBuyTransactions?.map((tx) => {
                    return (
                      <TableRow key={tx.id}>
                        <TableCell>{tx.products.description}</TableCell>
                        <TableCell className="text-right">
                          {formatPrice(tx.quantity * (tx.unitPrice ?? 0))}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <div className="w-full flex justify-between mt-8">
                <p className="text-xl font-bold flex flex-1">Total</p>
                <p className="text-xl font-bold">
                  {formatPrice(totalExpenses)}
                </p>
              </div>
            </div>

            {/* sell history */}
            <div className="flex flex-col flex-1">
              <h3 className="text-2xl font-semibold">Sales</h3>

              <Table className="text-lg w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="w-full">
                  {dailySellTransactions?.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{tx.products.description}</TableCell>
                      <TableCell className="text-right">
                        {formatPrice(tx.quantity * (tx.unitPrice ?? 0))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="w-full flex justify-between mt-8">
                <p className="text-xl font-bold flex flex-1">Total</p>
                <p className="text-xl font-bold">{formatPrice(totalSales)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default DailyTransactions;
