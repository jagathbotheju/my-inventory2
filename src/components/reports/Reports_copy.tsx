"use client";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { cn, formatPrice } from "@/lib/utils";
import { CalendarIcon, Loader2, PrinterIcon } from "lucide-react";
import { format } from "date-fns";
import DateRangePicker from "../DateRangePicker";
import { useRef, useState } from "react";
import { useSellTxDateRange } from "@/server/backend/queries/sellTxQueries";
import { User } from "@/server/db/schema/users";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { SellTransactionExt } from "@/server/db/schema/sellTransactions";
import _ from "lodash";
import { useReactToPrint } from "react-to-print";
import { toast } from "sonner";

interface Props {
  user: User;
}

const Reports = ({ user }: Props) => {
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date(),
  });

  const printRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({
    contentRef: printRef,
    documentTitle: `sales-report-${format(
      dateRange.from,
      "yyyy-MMM-dd"
    )} - ${format(dateRange.to, "yyyy-MMM-dd")}`,
    onAfterPrint: () => toast.success("Sales report printed successfully"),
  });

  const { data: sellTxs, isLoading } = useSellTxDateRange({
    userId: user.id,
    // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
    from: dateRange.from,
    to: dateRange.to,
  });

  console.log("sellTxs", sellTxs);

  const customers = _.keys(sellTxs);
  const cusTxs = _.values(sellTxs);

  return (
    <Card className="flex flex-col w-full h-fit bg-transparent dark:border-primary/40">
      <CardHeader>
        <CardTitle className="text-4xl font-bold flex justify-between items-center">
          <p>Sales Report</p>

          <div className="flex items-center gap-4">
            <DateRangePicker setDateRange={setDateRange}>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left",
                  !dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <span className="tracking-widest">
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </span>
                  ) : (
                    <span className="tracking-widest">
                      {format(dateRange.from, "LLL dd, y")}
                    </span>
                  )
                ) : (
                  <span className="tracking-widest">Pick date range</span>
                )}
              </Button>
            </DateRangePicker>
            {dateRange.from < dateRange.to && (
              <PrinterIcon
                className="text-primary cursor-pointer"
                onClick={reactToPrintFn}
              />
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center w-full">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : !sellTxs ? (
          <div className="flex items-center justify-center w-full">
            <h3 className="text-3xl font-semibold">No Transactions Found!</h3>
          </div>
        ) : (
          // print page
          <div className="flex flex-col gap-4 w-full p-8" ref={printRef}>
            <div className="print:block hidden flex-col gap-2 ">
              <h2 className="text-4xl font-bold">MyInventory</h2>
              <div className="flex gap-2">
                <h3 className="text-xl font-semibold">Sales Report</h3>
                <h3 className="text-xl font-semibold">
                  {format(dateRange.from, "yyyy-MMM-dd")} -{" "}
                  {format(dateRange.to, "yyyy-MMM-dd")}
                </h3>
              </div>
            </div>

            {customers.map((customer, index) => {
              const customerTxs = cusTxs[index] as SellTransactionExt[];
              const totalAmount = customerTxs.reduce((acc, item) => {
                return (acc += (item.unitPrice ?? 0) * item.quantity);
              }, 0);
              return (
                <div className="flex flex-col mb-4" key={customer + index}>
                  <div className="flex justify-between items-center border border-b border-t-transparent border-r-transparent border-l-transparent border-primary">
                    <h3 className="text-xl font-semibold">{customer}</h3>
                    <p className="text-xl font-semibold">
                      {formatPrice(totalAmount)}
                    </p>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Product Number</TableHead>
                        <TableHead>Invoice Number</TableHead>
                        <TableHead>Selling Price</TableHead>
                        <TableHead>Quantity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerTxs.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>
                            {format(tx.date, "yyyy-MMM-dd")}
                          </TableCell>
                          <TableCell>
                            {tx.productNumber?.toUpperCase()}
                          </TableCell>
                          <TableCell>
                            {tx.invoiceNumber.toUpperCase()}
                          </TableCell>
                          <TableCell>
                            {formatPrice(tx.unitPrice ?? 0)}
                          </TableCell>
                          <TableCell>{tx.quantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Reports;
