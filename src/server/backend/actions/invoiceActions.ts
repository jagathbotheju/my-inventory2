"use server";
import { db } from "@/server/db";
import { sql } from "drizzle-orm";
import { sellTxInvoices } from "@/server/db/schema";
import { SellTxInvoiceExt } from "@/server/db/schema/sellTxInvoices";

export const getSellTxInvoicesForPeriod = async ({
  userId,
  period,
  timeFrame,
}: {
  userId: string;
  period: Period;
  timeFrame: TimeFrame;
}) => {
  const year = period.year;
  const month =
    period.month.toString().length > 1 ? period.month : `0${period.month}`;

  const transactions = await db.query.sellTxInvoices.findMany({
    where:
      timeFrame === "month"
        ? sql`to_char(${sellTxInvoices.date},'MM') like ${month} and to_char(${sellTxInvoices.date},'YYYY') like ${year} and ${sellTxInvoices.userId} like ${userId}`
        : sql`to_char(${sellTxInvoices.date},'YYYY') like ${year} and ${sellTxInvoices.userId} like ${userId}`,
    with: {
      sellTransactions: {
        with: {
          customers: true,
        },
      },
      sellTxPayments: {
        with: {
          sellTxPaymentCheques: true,
        },
      },
    },
  });

  return transactions as SellTxInvoiceExt[];
};
