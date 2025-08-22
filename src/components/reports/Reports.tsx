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
import { Separator } from "../ui/separator";
import { Customer } from "@/server/db/schema/customers";
import CustomersAutoComplete from "../CustomersAutoComplete";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  user: User;
}

const Reports = ({ user }: Props) => {
  const queryClient = useQueryClient();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [allReports, setAllReports] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date(),
  });

  // print
  const printRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({
    contentRef: printRef,
    documentTitle: `sales-report-${format(
      dateRange.from,
      "yyyy-MMM-dd"
    )} - ${format(dateRange.to, "yyyy-MMM-dd")}`,
    onAfterPrint: () => toast.success("Sales report printed successfully"),
  });

  // data
  const { data: sellTxs, isLoading } = useSellTxDateRange({
    customerId: customer?.id,
    userId: user.id,
    // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
    from: dateRange.from,
    to: dateRange.to,
  });

  const customers = _.keys(sellTxs);
  const cusTxs = _.values(sellTxs);

  return (
    <Card className="flex flex-col w-full h-fit bg-transparent dark:border-primary/40">
      <CardHeader>
        <CardTitle className="text-4xl font-bold flex flex-col gap-4">
          <p>{allReports ? "All Sales Report" : "Sales Report for Customer"}</p>

          {/* report types - ALL | Customer */}
          <div className="flex items-center gap-4">
            <Button
              onClick={() => {
                setAllReports(!allReports);
                queryClient.removeQueries({
                  queryKey: ["sell-tx-date-range"],
                });
                queryClient.removeQueries({
                  queryKey: ["search-customers"],
                });
                setDateRange({ from: new Date(), to: new Date() });
                setCustomer(null);
              }}
              className="tracking-wide"
            >
              {allReports ? "Customer Reports" : "All Reports"}
            </Button>

            {!allReports && (
              <CustomersAutoComplete
                customer={customer}
                setCustomer={setCustomer}
                userId={user.id}
                setDateRange={setDateRange}
              />
            )}

            {/* date range picker */}
            <DateRangePicker setDateRange={setDateRange}>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-fit justify-start text-left dark:bg-slate-900 bg-slate-50",
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

            {/* print button */}
            {!_.isEmpty(sellTxs) && (
              <PrinterIcon
                className="text-primary cursor-pointer w-6 h-6"
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
        ) : _.isEmpty(sellTxs) &&
          dateRange.from.getTime() !== dateRange.to.getTime() ? (
          <div className="flex items-center justify-center w-full mt-6">
            <h3 className="text-3xl font-semibold text-muted-foreground">
              No Transactions Found!
            </h3>
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

              let totalPaymentReceived = 0;
              const fCustomerTxs = customerTxs.reduce(
                (acc, sellTx) => {
                  if (sellTx.customers.name.toLowerCase() === "cash bill")
                    return acc;
                  const exist = acc.find(
                    (item) => item.invoiceNumber === sellTx.invoiceNumber
                  );

                  if (exist) {
                    exist.invoiceTotal +=
                      (sellTx.unitPrice ?? 0) * sellTx.quantity;
                  } else {
                    const paymentReceived =
                      sellTx.sellTxInvoices.sellTxPayments.reduce(
                        (acc, item) => {
                          if (item.paymentMode === "cash") {
                            acc += item.cacheAmount ?? 0;
                          }
                          if (item.paymentMode === "cheque") {
                            acc += item.sellTxPaymentCheques.reduce(
                              (acc, item) => acc + (item.amount ?? 0),
                              0
                            );
                          }
                          if (item.paymentMode === "cash-cheque") {
                            acc += item.cacheAmount ?? 0;
                            acc += item.sellTxPaymentCheques.reduce(
                              (acc, item) => acc + (item.amount ?? 0),
                              0
                            );
                          }
                          return acc;
                        },
                        0
                      );

                    totalPaymentReceived += paymentReceived;
                    acc.push({
                      invoiceNumber: sellTx.invoiceNumber,
                      invoiceTotal: (sellTx.unitPrice ?? 0) * sellTx.quantity,
                      date: sellTx.date,
                      paymentReceived,
                    });
                  }

                  return acc;
                },
                [] as {
                  invoiceNumber: string;
                  invoiceTotal: number;
                  date: string;
                  paymentReceived: number;
                }[]
              );

              return (
                <div className="flex flex-col mb-4" key={customer + index}>
                  <div className="flex justify-between items-center border border-b border-t-transparent border-r-transparent border-l-transparent border-primary">
                    <h3 className="text-lg font-semibold">{customer}</h3>
                    <div className="flex items-center gap-4">
                      {totalPaymentReceived !== 0 && (
                        <>
                          <p className="text-lg font-semibold">
                            <span className="mr-2">Payment Received</span>{" "}
                            {formatPrice(totalPaymentReceived)}
                          </p>
                          <Separator
                            orientation="vertical"
                            className="h-6 w-[2px] bg-primary"
                          />
                        </>
                      )}
                      <p className="text-lg font-semibold">
                        <span className="mr-2">Total</span>{" "}
                        {formatPrice(totalAmount)}
                      </p>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Invoice Number</TableHead>
                        <TableHead>Total</TableHead>
                        {totalPaymentReceived !== 0 && (
                          <TableHead>Payment Received</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fCustomerTxs.map((tx, index) => {
                        // const amountReceived=tx.
                        return (
                          <TableRow key={tx.invoiceNumber + index}>
                            <TableCell>
                              {format(tx.date, "yyyy-MMM-dd")}
                            </TableCell>
                            <TableCell>
                              {tx.invoiceNumber?.toUpperCase()}
                            </TableCell>
                            <TableCell>
                              {formatPrice(tx.invoiceTotal ?? 0)}
                            </TableCell>
                            {totalPaymentReceived !== 0 && (
                              <TableCell>
                                {formatPrice(tx.paymentReceived ?? 0)}
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
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
