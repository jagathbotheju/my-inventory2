"use server";
import { db } from "@/server/db";
import { desc, sql } from "drizzle-orm";
import {
  sellTxInvoices,
  sellTxPaymentCheques,
  sellTxPayments,
} from "@/server/db/schema";
import { SellTxInvoiceExt } from "@/server/db/schema/sellTxInvoices";

export const addPayment = async ({
  invoiceId,
  paymentMode,
  cashAmount,
  chequeData,
}: {
  invoiceId: string;
  paymentMode: string;
  cashAmount: number;
  chequeData:
    | {
        chequeNumber?: string | undefined;
        chequeDate?: Date | undefined;
        bankName?: string | undefined;
        amount?: number | undefined;
      }
    | undefined;
}) => {
  // new payment
  const newTxPayment = await db
    .insert(sellTxPayments)
    .values({
      invoiceId,
      paymentMode,
      cacheAmount: cashAmount,
    })
    .returning();

  if (!newTxPayment.length) return { error: "Could not add Payment" };

  // let chequeAmount = 0;
  if (
    (paymentMode === "cheque" || paymentMode === "cash-cheque") &&
    chequeData
  ) {
    await db
      .insert(sellTxPaymentCheques)
      .values({
        sellTxPaymentId: newTxPayment[0].id,
        chequeNumber: chequeData.chequeNumber as string,
        bankName: chequeData.bankName as string,
        amount: chequeData.amount ?? 0,
        chequeDate: chequeData.chequeDate?.toDateString(),
      })
      .returning();
    // chequeAmount += chequeData.amount ?? 0;
  }

  //update invoice totalCash
  const updatedInvoice = await db
    .update(sellTxInvoices)
    .set({
      totalCash: sql`${sellTxInvoices.totalCash}+${cashAmount} + ${chequeData?.amount}`,
    })
    .returning();
  if (!updatedInvoice.length) return { error: "Could not add Payment" };

  return { success: "Payment Added" };
};

export const getSellTxInvoicesForPeriod = async ({
  userId,
  period,
  timeFrame,
  searchTerm,
}: {
  userId: string;
  period: Period;
  timeFrame: TimeFrame;
  searchTerm: string;
}) => {
  const year = period.year;
  const month =
    period.month.toString().length > 1 ? period.month : `0${period.month}`;
  const fSearch = `%${searchTerm}%`;

  if (searchTerm.length) {
    const transactions = await db.query.sellTxInvoices.findMany({
      where:
        timeFrame === "month"
          ? sql`to_char(${sellTxInvoices.date},'MM') like ${month} and to_char(${sellTxInvoices.date},'YYYY') like ${year} and ${sellTxInvoices.userId} like ${userId} and ${sellTxInvoices.invoiceNumber} ilike ${fSearch}`
          : sql`to_char(${sellTxInvoices.date},'YYYY') like ${year} and ${sellTxInvoices.userId} like ${userId} and ${sellTxInvoices.invoiceNumber} ilike ${fSearch}`,
      with: {
        sellTransactions: {
          with: {
            customers: true,
            products: true,
          },
        },
        sellTxPayments: {
          with: {
            sellTxPaymentCheques: true,
          },
        },
      },
      orderBy: [desc(sellTxInvoices.date), desc(sellTxInvoices.invoiceNumber)],
    });

    return transactions as SellTxInvoiceExt[];
  } else {
    const transactions = await db.query.sellTxInvoices.findMany({
      where:
        timeFrame === "month"
          ? sql`to_char(${sellTxInvoices.date},'MM') like ${month} and to_char(${sellTxInvoices.date},'YYYY') like ${year} and ${sellTxInvoices.userId} like ${userId}`
          : sql`to_char(${sellTxInvoices.date},'YYYY') like ${year} and ${sellTxInvoices.userId} like ${userId}`,
      with: {
        sellTransactions: {
          with: {
            customers: true,
            products: true,
          },
        },
        sellTxPayments: {
          with: {
            sellTxPaymentCheques: true,
          },
        },
      },
      orderBy: [desc(sellTxInvoices.date), desc(sellTxInvoices.invoiceNumber)],
    });

    return transactions as SellTxInvoiceExt[];
  }
};
