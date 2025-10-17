"use server";

import { db } from "@/server/db";
import { buyTxInvoices, stocks } from "@/server/db/schema";
import { buyMonthHistory } from "@/server/db/schema/buyMonthHistory";
import {
  BuyTransactionExt,
  buyTransactions,
} from "@/server/db/schema/buyTransactions";
import {
  BuyYearHistory,
  buyYearHistory,
} from "@/server/db/schema/buyYearHistory";
import { and, asc, count, desc, eq, sql, sum } from "drizzle-orm";

//---QRY-DAILY-BUY-TRANSACTIONS---
export const getDailyBuyTransactions = async ({
  buyDate,
  userId,
}: {
  buyDate: string;
  userId: string;
}) => {
  const date = new Date(buyDate).getDate();
  const month = new Date(buyDate).getMonth() + 1;
  const year = new Date(buyDate).getFullYear();
  const fMonth = month < 10 ? `0${month}` : month;
  const fDate = date < 10 ? `0${date}` : date;

  const buyTx = await db.query.buyTransactions.findMany({
    where: sql`to_char(${buyTransactions.date},'dd') like ${fDate} and to_char(${buyTransactions.date},'MM') like ${fMonth} and to_char(${buyTransactions.date},'YYYY') like ${year} and ${buyTransactions.userId} like ${userId}`,
    with: {
      products: true,
    },
    orderBy: desc(buyTransactions.date),
  });

  return buyTx as BuyTransactionExt[];
};

//---QRY-get-buy-transactions-pagination
export const getBuyTransactionsPagination = async ({
  userId,
  period,
  timeFrame,
  page,
  pageSize = 10,
  searchTerm,
}: {
  userId: string;
  period: Period;
  timeFrame: TimeFrame;
  page: number;
  pageSize?: number;
  searchTerm?: string;
}) => {
  const year = period.year;
  const month =
    period.month.toString().length > 1 ? period.month : `0${period.month}`;
  // const fSearch = `%${searchTerm}%`;

  if (searchTerm?.length) {
    //if search, find in all txs
    const transactions = await db.query.buyTransactions.findMany({
      where: eq(buyTransactions.userId, userId),
      with: {
        products: {
          with: {
            suppliers: true,
          },
        },
        buyTxInvoices: true,
      },
      orderBy: desc(buyTransactions.date),
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    if (transactions.length) {
      const result = transactions.filter(
        (item) =>
          item.buyTxInvoices.invoiceNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.products.productNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
      return result as BuyTransactionExt[];
    }

    return [] as BuyTransactionExt[];
  } else {
    //if not search, find by period
    const transactions = await db.query.buyTransactions.findMany({
      where:
        timeFrame === "month"
          ? sql`to_char(${buyTransactions.date},'MM') like ${month} and to_char(${buyTransactions.date},'YYYY') like ${year} and ${buyTransactions.userId} like ${userId}`
          : sql`to_char(${buyTransactions.date},'YYYY') like ${year} and ${buyTransactions.userId} like ${userId}`,
      with: {
        products: {
          with: {
            suppliers: true,
          },
        },
        buyTxInvoices: true,
      },
      orderBy: desc(buyTransactions.date),
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });
    return transactions as BuyTransactionExt[];
  }
};

//---MUT-delete-buy-transaction---
export const deleteBuyTransaction = async ({
  userId,
  buyTx,
}: {
  userId: string;
  buyTx: BuyTransactionExt;
}) => {
  try {
    //delete transaction
    const deletedTx = await db
      .delete(buyTransactions)
      .where(
        and(
          eq(buyTransactions.id, buyTx.id),
          eq(buyTransactions.userId, userId)
        )
      )
      .returning();
    if (!deletedTx.length)
      return {
        error: "Could not delete Transaction",
      };

    const deletedTxTotalPrice =
      deletedTx[0].quantity * (deletedTx[0].unitPrice ?? 0);

    //update invoice
    const existInvoice = await db
      .select()
      .from(buyTxInvoices)
      .where(
        and(
          eq(buyTxInvoices.userId, userId),
          eq(buyTxInvoices.id, deletedTx[0].invoiceId)
        )
      );
    const existInvoiceTotalAmount = existInvoice[0].totalAmount ?? 0;
    if (existInvoice.length && existInvoiceTotalAmount > deletedTxTotalPrice) {
      await db
        .update(buyTxInvoices)
        .set({ totalAmount: existInvoiceTotalAmount - deletedTxTotalPrice })
        .where(eq(buyTxInvoices.id, deletedTx[0].invoiceId));
    } else {
      await db
        .delete(buyTxInvoices)
        .where(eq(buyTxInvoices.id, deletedTx[0].invoiceId));
    }

    // update month history
    const existBuyMonthHistory = await db
      .select()
      .from(buyMonthHistory)
      .where(
        and(
          eq(buyMonthHistory.userId, deletedTx[0].userId),
          eq(buyMonthHistory.day, new Date(deletedTx[0].date).getDate()),
          eq(buyMonthHistory.month, new Date(deletedTx[0].date).getMonth() + 1),
          eq(buyMonthHistory.year, new Date(deletedTx[0].date).getFullYear())
        )
      );
    const existMonthHistoryTotalPrice = existBuyMonthHistory[0].totalPrice ?? 0;
    if (
      existBuyMonthHistory.length &&
      existMonthHistoryTotalPrice > deletedTxTotalPrice
    ) {
      await db
        .update(buyMonthHistory)
        .set({
          totalPrice: existMonthHistoryTotalPrice - deletedTxTotalPrice,
        })
        .where(
          and(
            eq(buyMonthHistory.userId, deletedTx[0].userId),
            eq(buyMonthHistory.day, new Date(deletedTx[0].date).getDate()),
            eq(
              buyMonthHistory.month,
              new Date(deletedTx[0].date).getMonth() + 1
            ),
            eq(buyMonthHistory.year, new Date(deletedTx[0].date).getFullYear())
          )
        );
    } else {
      await db
        .delete(buyMonthHistory)
        .where(
          and(
            eq(buyMonthHistory.userId, deletedTx[0].userId),
            eq(buyMonthHistory.day, new Date(deletedTx[0].date).getDate()),
            eq(
              buyMonthHistory.month,
              new Date(deletedTx[0].date).getMonth() + 1
            ),
            eq(buyMonthHistory.year, new Date(deletedTx[0].date).getFullYear())
          )
        );
    }

    // update year history
    const existBuyYearHistory = await db
      .select()
      .from(buyYearHistory)
      .where(
        and(
          eq(buyYearHistory.userId, deletedTx[0].userId),
          eq(buyYearHistory.month, new Date(deletedTx[0].date).getMonth() + 1),
          eq(buyYearHistory.year, new Date(deletedTx[0].date).getFullYear())
        )
      );
    const existYearHistoryTotalPrice = existBuyYearHistory[0].totalPrice ?? 0;
    if (
      existBuyYearHistory.length &&
      existYearHistoryTotalPrice > deletedTxTotalPrice
    ) {
      await db
        .update(buyYearHistory)
        .set({
          totalPrice: existYearHistoryTotalPrice - deletedTxTotalPrice,
        })
        .where(
          and(
            eq(buyYearHistory.userId, deletedTx[0].userId),
            eq(
              buyYearHistory.month,
              new Date(deletedTx[0].date).getMonth() + 1
            ),
            eq(buyYearHistory.year, new Date(deletedTx[0].date).getFullYear())
          )
        );
    } else {
      await db
        .delete(buyYearHistory)
        .where(
          and(
            eq(buyYearHistory.userId, deletedTx[0].userId),
            eq(
              buyYearHistory.month,
              new Date(deletedTx[0].date).getMonth() + 1
            ),
            eq(buyYearHistory.year, new Date(deletedTx[0].date).getFullYear())
          )
        );
    }

    //update stock
    const existStock = await db
      .select()
      .from(stocks)
      .where(
        and(eq(stocks.userId, userId), eq(stocks.productId, buyTx.productId))
      );
    if (existStock.length) {
      await db
        .update(stocks)
        .set({
          quantity: existStock[0].quantity - buyTx.quantity,
        })
        .where(
          and(eq(stocks.userId, userId), eq(stocks.productId, buyTx.productId))
        )
        .returning();
    }

    if (deletedTx.length)
      return { success: "Transaction deleted successfully" };

    return { error: "Could not delete Transaction" };
  } catch (error) {
    console.log(error);
    return { error: "Could not delete Transaction" };
  }
};

//---QRY-BUY-TX-YEARS---
export const getBuyTxYears = async () => {
  const years = await db
    .selectDistinctOn([buyYearHistory.year])
    .from(buyYearHistory)
    .orderBy(asc(buyYearHistory.year));

  return years as BuyYearHistory[];
};

//---QRY-buyTransactions-count---
export const getBuyTxCount = async ({
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

  const buyTxCount = await db
    .select({ count: count() })
    .from(buyTransactions)
    .where(
      timeFrame === "month"
        ? sql`to_char(${buyTransactions.date},'MM') like ${month} and to_char(${buyTransactions.date},'YYYY') like ${year} and ${buyTransactions.userId} like ${userId}`
        : sql`to_char(${buyTransactions.date},'YYYY') like ${year} and ${buyTransactions.userId} like ${userId}`
    );
  return buyTxCount[0];
};

//---QRY-buyTransactions-total-purchases---
export const getBuyTxTotalPurchase = async ({
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

  const totalPurchase = await db
    .select({
      value: sum(
        sql`${buyTransactions.quantity} * ${buyTransactions.unitPrice}`
      ),
    })
    .from(buyTransactions)
    .where(
      timeFrame === "month"
        ? sql`to_char(${buyTransactions.date},'MM') like ${month} and to_char(${buyTransactions.date},'YYYY') like ${year} and ${buyTransactions.userId} like ${userId}`
        : sql`to_char(${buyTransactions.date},'YYYY') like ${year} and ${buyTransactions.userId} like ${userId}`
    );

  return totalPurchase[0];
};

//---QRY-buyTransactions-for-user---
export const getBuyTxByUserProduct = async ({
  userId,
  productId,
}: {
  userId: string;
  productId: string;
}) => {
  const transactions = await db.query.buyTransactions.findMany({
    where: and(
      eq(buyTransactions.userId, userId),
      eq(buyTransactions.productId, productId)
    ),
    with: {
      products: {
        with: {
          unitOfMeasurements: true,
          suppliers: true,
        },
      },
    },
    orderBy: desc(buyTransactions.date),
  });
  return transactions as BuyTransactionExt[];
};
