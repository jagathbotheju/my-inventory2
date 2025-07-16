"use server";
import { db } from "@/server/db";
import { desc, eq, sql } from "drizzle-orm";
import {
  buyTransactions,
  buyTxInvoices,
  buyTxPayments,
  sellTxInvoices,
  sellTxPaymentCheques,
  sellTxPayments,
} from "@/server/db/schema";
import { SellTxInvoiceExt } from "@/server/db/schema/sellTxInvoices";
import { SellTxPaymentCheques } from "@/server/db/schema/sellTxPaymentCheques";
import { BuyTxInvoiceExt } from "@/server/db/schema/buyTxInvoices";
import {
  buyTxPaymentCheques,
  BuyTxPaymentCheques,
} from "@/server/db/schema/buyTxPaymentCheques";
import _ from "lodash";

//Add SellTx Payment
export const addSellTxPayment = async ({
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

//Add BuyTx Payment
export const addBuyTxPayment = async ({
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
    .insert(buyTxPayments)
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
      buyTxPaymentId: newTxPayment[0].id,
      chequeNumber: item.chequeNumber,
      chequeDate: item.chequeDate?.toDateString(),
      bankName: item.bankName,
      amount: item.amount,
    })) as BuyTxPaymentCheques[];

    const newCheques = await db
      .insert(buyTxPaymentCheques)
      .values(chequeDataWithPaymentId)
      .returning();

    chequesAmount = newCheques.reduce(
      (acc, item) => (acc += item.amount ? item.amount : 0),
      0
    );
  }

  const updatedInvoice = await db
    .update(buyTxInvoices)
    .set({
      totalCash: sql`${buyTxInvoices.totalCash} + ${cashAmount} + ${chequesAmount}`,
    })
    .where(eq(buyTxInvoices.id, invoiceId))
    .returning();
  if (!updatedInvoice.length) return { error: "Could not add Payment" };

  return { success: "Payment Added" };
};

//Search SellTx Invoices
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

//Search BuyTx Invoices
export const searchBuyTxInvoices = async ({
  userId,
  searchTerm,
}: {
  userId: string;
  searchTerm: string;
}) => {
  const fSearch = `%${searchTerm}%`;
  const transactions = await db.query.buyTxInvoices.findMany({
    where: sql`${buyTxInvoices.userId} like ${userId} and ${buyTxInvoices.invoiceNumber} ilike ${fSearch}`,
    with: {
      buyTransactions: {
        with: {
          suppliers: true,
          products: true,
        },
      },
      buyTxPayments: {
        with: {
          buyTxPaymentCheques: true,
        },
      },
    },
    orderBy: [desc(sellTxInvoices.date), desc(sellTxInvoices.invoiceNumber)],
  });

  return transactions as BuyTxInvoiceExt[];
};

//SellTx Invoices Period
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

//BuyTx Invoices Period
export const getBuyTxInvoicesForPeriod = async ({
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

  const transactions = await db.query.buyTxInvoices.findMany({
    where:
      timeFrame === "month"
        ? sql`to_char(${buyTxInvoices.date},'MM') like ${month} and to_char(${buyTxInvoices.date},'YYYY') like ${year} and ${buyTxInvoices.userId} like ${userId}`
        : sql`to_char(${buyTxInvoices.date},'YYYY') like ${year} and ${buyTxInvoices.userId} like ${userId}`,
    with: {
      buyTransactions: {
        with: {
          suppliers: true,
          products: true,
        },
      },
      buyTxPayments: {
        with: {
          buyTxPaymentCheques: true,
        },
      },
    },
    orderBy: [desc(buyTxInvoices.date), desc(buyTxInvoices.invoiceNumber)],
  });

  return transactions as BuyTxInvoiceExt[];
};

//BuyTx due cheques
export const buyTxDueChecks = async (userId: string) => {
  const buyTxs = await db.query.buyTxInvoices.findMany({
    where: eq(buyTransactions.userId, userId),
    with: {
      buyTxPayments: {
        with: {
          buyTxPaymentCheques: true,
        },
      },
    },
  });
  if (buyTxs.length === 0) return [];

  const cheques = [] as BuyTxCurrentCheques[];

  buyTxs.map((tx) => {
    tx.buyTxPayments.map((payment) => {
      if (
        payment.paymentMode === "cheque" ||
        payment.paymentMode === "cash-cheque"
      ) {
        payment.buyTxPaymentCheques.map((cheque) => {
          if (cheque.chequeDate && new Date(cheque.chequeDate) >= new Date()) {
            cheques.push({
              ...cheque,
              invoiceNumber: tx.invoiceNumber,
            });
          }
        });
      }
    });
  });

  return _.sortBy(cheques, "chequeDate") as BuyTxCurrentCheques[];
};
