"use server";
import { db } from "@/server/db";
import { desc, eq, sql } from "drizzle-orm";
import {
  sellTxInvoices,
  sellTxPaymentCheques,
  sellTxPayments,
} from "@/server/db/schema";
import { SellTxInvoiceExt } from "@/server/db/schema/sellTxInvoices";
import { SellTxPaymentCheques } from "@/server/db/schema/sellTxPaymentCheques";
import {
  BuyTransactionExt,
  buyTransactions,
} from "@/server/db/schema/buyTransactions";

export const addPayment = async ({
  invoiceId,
  paymentMode,
  cashAmount,
  creditAmount,
  chequeData,
}: {
  invoiceId: string;
  paymentMode: string;
  cashAmount: number;
  creditAmount: number;
  chequeData:
    | {
        chequeNumber?: string | undefined;
        chequeDate?: Date | undefined;
        bankName?: string | undefined;
        amount?: number | undefined;
      }[]
    | undefined;
}) => {
  // new payment
  const newTxPayment = await db
    .insert(sellTxPayments)
    .values({
      invoiceId,
      paymentMode,
      cacheAmount: cashAmount,
      creditAmount,
    })
    .returning();

  if (!newTxPayment.length) return { error: "Could not add Payment" };

  let chequesAmount = 0;
  if (
    chequeData &&
    chequeData.length &&
    (paymentMode === "cheque" || paymentMode === "cash-cheque")
  ) {
    const chequeDataWithPaymentId = chequeData.map((item) => ({
      sellTxPaymentId: newTxPayment[0].id,
      chequeNumber: item.chequeNumber,
      chequeDate: item.chequeDate?.toDateString(),
      bankName: item.bankName,
      amount: item.amount,
    })) as SellTxPaymentCheques[];
    const newCheques = await db
      .insert(sellTxPaymentCheques)
      .values(chequeDataWithPaymentId)
      .returning();
    chequesAmount = newCheques.reduce(
      (acc, item) => (acc += item.amount ? item.amount : 0),
      0
    );
  }

  const updatedInvoice = await db
    .update(sellTxInvoices)
    .set({
      totalCash: sql`${sellTxInvoices.totalCash} + ${cashAmount} + ${chequesAmount}`,
    })
    .where(eq(sellTxInvoices.id, invoiceId))
    .returning();
  if (!updatedInvoice.length) return { error: "Could not add Payment" };

  return { success: "Payment Added" };
};

//SEARCH SELL TX INVOICES
export const searchSellTxInvoices = async ({
  userId,
  searchTerm,
}: {
  userId: string;
  searchTerm: string;
}) => {
  const fSearch = `%${searchTerm}%`;
  const invoices = await db.query.sellTxInvoices.findMany({
    where: sql`${sellTxInvoices.userId} like ${userId} and ${sellTxInvoices.invoiceNumber} ilike ${fSearch}`,
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

  return invoices as SellTxInvoiceExt[];
};

//SEARCH BUY TX INVOICES
export const searchBuyTxInvoices = async ({
  userId,
  searchTerm,
}: {
  userId: string;
  searchTerm: string;
}) => {
  const fSearch = `%${searchTerm}%`;
  const transactions = await db.query.buyTransactions.findMany({
    where: sql`${buyTransactions.userId} like ${userId} and ${buyTransactions.invoiceNumber} ilike ${fSearch}`,
  });

  return transactions as BuyTransactionExt[];
};

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
};
