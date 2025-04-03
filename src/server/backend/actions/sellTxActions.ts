"use server";
import { db } from "@/server/db";
import { stocks } from "@/server/db/schema";
import {
  SellMonthHistory,
  sellMonthHistory,
} from "@/server/db/schema/sellMonthHistory";
import {
  SellTransaction,
  SellTransactionExit,
  sellTransactions,
} from "@/server/db/schema/sellTransactions";
import {
  SellYearHistory,
  sellYearHistory,
} from "@/server/db/schema/sellYearHistory";
import { and, asc, count, desc, eq, sql, sum } from "drizzle-orm";

export const addSellTransaction = async ({
  data,
  supplierId,
}: {
  data: SellTransaction;
  supplierId: string;
}) => {
  try {
    const newTransaction = await db
      .insert(sellTransactions)
      .values(data)
      .returning();

    const existSellMonthHistory = await db
      .select()
      .from(sellMonthHistory)
      .where(
        and(
          eq(sellMonthHistory.userId, data.userId),
          eq(sellMonthHistory.day, new Date(data.date).getDate()),
          eq(sellMonthHistory.month, new Date(data.date).getMonth() + 1),
          eq(sellMonthHistory.year, new Date(data.date).getFullYear())
        )
      );
    const existSellYearHistory = await db
      .select()
      .from(sellYearHistory)
      .where(
        and(
          eq(sellYearHistory.userId, data.userId),
          eq(sellYearHistory.month, new Date(data.date).getMonth() + 1),
          eq(sellYearHistory.year, new Date(data.date).getFullYear())
        )
      );
    const existStock = await db
      .select()
      .from(stocks)
      .where(
        and(
          eq(stocks.userId, data.userId),
          eq(stocks.productId, data.productId),
          eq(stocks.supplierId, supplierId)
        )
      );

    let monthHistory = [] as SellMonthHistory[];
    let yearHistory = [] as SellYearHistory[];

    if (existSellMonthHistory.length) {
      monthHistory = await db
        .update(sellMonthHistory)
        .set({
          totalPrice:
            data.quantity * (data.unitPrice ?? 0) +
            (existSellMonthHistory[0].totalPrice ?? 0),
        })
        .where(
          and(
            eq(sellMonthHistory.userId, data.userId),
            eq(sellMonthHistory.day, new Date(data.date).getDate()),
            eq(sellMonthHistory.month, new Date(data.date).getMonth() + 1),
            eq(sellMonthHistory.year, new Date(data.date).getFullYear())
          )
        )
        .returning();
    } else {
      monthHistory = await db
        .insert(sellMonthHistory)
        .values({
          day: new Date(data.date).getDate(),
          month: new Date(data.date).getMonth() + 1,
          year: new Date(data.date).getFullYear(),
          userId: data.userId,
          totalPrice: data.quantity * (data.unitPrice ?? 0),
        })
        .returning();
    }

    if (existSellYearHistory.length) {
      yearHistory = await db
        .update(sellYearHistory)
        .set({
          totalPrice:
            data.quantity * (data.unitPrice ?? 0) +
            (existSellYearHistory[0].totalPrice ?? 0),
        })
        .where(
          and(
            eq(sellYearHistory.userId, data.userId),
            eq(sellYearHistory.month, new Date(data.date).getMonth() + 1),
            eq(sellYearHistory.year, new Date(data.date).getFullYear())
          )
        )
        .returning();
    } else {
      yearHistory = await db
        .insert(sellYearHistory)
        .values({
          month: new Date(data.date).getMonth() + 1,
          year: new Date(data.date).getFullYear(),
          userId: data.userId,
          totalPrice: data.quantity * (data.unitPrice ?? 0),
        })
        .returning();
    }

    //update stock
    const updatedStock = await db
      .update(stocks)
      .set({
        quantity: existStock[0].quantity - data.quantity,
      })
      .where(
        and(
          eq(stocks.userId, data.userId),
          eq(stocks.productId, data.productId),
          eq(stocks.supplierId, data.supplierId as string),
          eq(stocks.unitPrice, data.purchasedPrice ?? 0)
        )
      )
      .returning();

    if (
      newTransaction.length &&
      monthHistory.length &&
      yearHistory.length &&
      updatedStock.length
    ) {
      return { success: "Sell Transaction added successfully" };
    }

    return { error: "Count not add Transaction" };
  } catch (error) {
    console.log(error);
    return { error: "Count not add Transaction" };
  }
};

export const deleteSellTransaction = async ({
  userId,
  sellTx,
}: {
  userId: string;
  sellTx: SellTransactionExit;
}) => {
  try {
    const deletedTx = await db
      .delete(sellTransactions)
      .where(
        and(
          eq(sellTransactions.id, sellTx.id),
          eq(sellTransactions.userId, userId)
        )
      )
      .returning();

    const existSellMonthHistory = await db
      .select()
      .from(sellMonthHistory)
      .where(
        and(
          eq(sellMonthHistory.userId, deletedTx[0].userId),
          eq(sellMonthHistory.day, new Date(deletedTx[0].date).getDate()),
          eq(
            sellMonthHistory.month,
            new Date(deletedTx[0].date).getMonth() + 1
          ),
          eq(sellMonthHistory.year, new Date(deletedTx[0].date).getFullYear())
        )
      );

    const existSellYearHistory = await db
      .select()
      .from(sellYearHistory)
      .where(
        and(
          eq(sellYearHistory.userId, deletedTx[0].userId),
          eq(sellYearHistory.month, new Date(deletedTx[0].date).getMonth() + 1),
          eq(sellYearHistory.year, new Date(deletedTx[0].date).getFullYear())
        )
      );

    // let monthHistory = [] as SellMonthHistory[];
    // let yearHistory = [] as SellYearHistory[];
    const deletedTxTotalPrice =
      deletedTx[0].quantity * (deletedTx[0].unitPrice ?? 0);
    const existMonthHistoryTotalPrice =
      existSellMonthHistory[0].totalPrice ?? 0;
    const existYearHistoryTotalPrice = existSellMonthHistory[0].totalPrice ?? 0;

    // update month history
    if (
      existSellMonthHistory.length &&
      existMonthHistoryTotalPrice > deletedTxTotalPrice
    ) {
      await db
        .update(sellMonthHistory)
        .set({
          totalPrice: existMonthHistoryTotalPrice - deletedTxTotalPrice,
        })
        .where(
          and(
            eq(sellMonthHistory.userId, deletedTx[0].userId),
            eq(sellMonthHistory.day, new Date(deletedTx[0].date).getDate()),
            eq(
              sellMonthHistory.month,
              new Date(deletedTx[0].date).getMonth() + 1
            ),
            eq(sellMonthHistory.year, new Date(deletedTx[0].date).getFullYear())
          )
        )
        .returning();
    } else {
      await db
        .delete(sellMonthHistory)
        .where(
          and(
            eq(sellMonthHistory.userId, deletedTx[0].userId),
            eq(sellMonthHistory.day, new Date(deletedTx[0].date).getDate()),
            eq(
              sellMonthHistory.month,
              new Date(deletedTx[0].date).getMonth() + 1
            ),
            eq(sellMonthHistory.year, new Date(deletedTx[0].date).getFullYear())
          )
        )
        .returning();
    }

    // update year history
    if (
      existSellYearHistory.length &&
      existYearHistoryTotalPrice > deletedTxTotalPrice
    ) {
      await db
        .update(sellYearHistory)
        .set({
          totalPrice: existYearHistoryTotalPrice - deletedTxTotalPrice,
        })
        .where(
          and(
            eq(sellYearHistory.userId, deletedTx[0].userId),
            eq(
              sellYearHistory.month,
              new Date(deletedTx[0].date).getMonth() + 1
            ),
            eq(sellYearHistory.year, new Date(deletedTx[0].date).getFullYear())
          )
        )
        .returning();
    } else {
      await db
        .delete(sellYearHistory)
        .where(
          and(
            eq(sellYearHistory.userId, deletedTx[0].userId),
            eq(
              sellYearHistory.month,
              new Date(deletedTx[0].date).getMonth() + 1
            ),
            eq(sellYearHistory.year, new Date(deletedTx[0].date).getFullYear())
          )
        )
        .returning();
    }

    //update stocks
    const existStock = await db
      .select()
      .from(stocks)
      .where(
        and(
          eq(stocks.userId, userId),
          eq(stocks.supplierId, sellTx.supplierId as string),
          eq(stocks.productId, sellTx.productId),
          eq(stocks.unitPrice, sellTx.purchasedPrice ?? 0)
        )
      );

    const updatedStock = await db
      .update(stocks)
      .set({
        quantity: existStock[0].quantity + sellTx.quantity,
      })
      .where(
        and(
          eq(stocks.userId, sellTx.userId),
          eq(stocks.productId, sellTx.productId),
          eq(stocks.supplierId, sellTx.supplierId as string),
          eq(stocks.unitPrice, sellTx.purchasedPrice ?? 0)
        )
      )
      .returning();

    if (deletedTx.length && updatedStock.length)
      return { success: "Transaction deleted successfully" };
    return { error: "Could not delete Transaction" };
  } catch (error) {
    console.log(error);
    return { error: "Could not delete Transaction" };
  }
};

export const getSellTransactionsPagination = async ({
  userId,
  period,
  timeFrame,
  page,
  pageSize = 10,
}: {
  userId: string;
  period: Period;
  timeFrame: TimeFrame;
  page: number;
  pageSize?: number;
}) => {
  // const transactions = await db.query.sellTransactions.findMany({
  //   where: eq(sellTransactions.userId, userId),
  //   with: {
  //     products: true,
  //     customers: true,
  //   },
  //   orderBy: desc(sellTransactions.date),
  // });

  const year = period.year;
  const month =
    period.month.toString().length > 1 ? period.month : `0${period.month}`;

  const transactions = await db.query.sellTransactions.findMany({
    where:
      timeFrame === "month"
        ? sql`to_char(${sellTransactions.date},'MM') like ${month} and to_char(${sellTransactions.date},'YYYY') like ${year} and ${sellTransactions.userId} like ${userId}`
        : sql`to_char(${sellTransactions.date},'YYYY') like ${year} and ${sellTransactions.userId} like ${userId}`,
    with: {
      products: true,
      customers: true,
    },
    limit: pageSize,
    offset: (page - 1) * pageSize,
    orderBy: desc(sellTransactions.date),
  });
  return transactions as SellTransactionExit[];
};

export const getSellTxCount = async ({
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

  const sellTxCount = await db
    .select({ count: count() })
    .from(sellTransactions)
    .where(
      timeFrame === "month"
        ? sql`to_char(${sellTransactions.date},'MM') like ${month} and to_char(${sellTransactions.date},'YYYY') like ${year} and ${sellTransactions.userId} like ${userId}`
        : sql`to_char(${sellTransactions.date},'YYYY') like ${year} and ${sellTransactions.userId} like ${userId}`
    );
  return sellTxCount[0];
};

export const getSellTxTotalSales = async ({
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
        sql`${sellTransactions.quantity} * ${sellTransactions.unitPrice}`
      ),
    })
    .from(sellTransactions)
    .where(
      timeFrame === "month"
        ? sql`to_char(${sellTransactions.date},'MM') like ${month} and to_char(${sellTransactions.date},'YYYY') like ${year} and ${sellTransactions.userId} like ${userId}`
        : sql`to_char(${sellTransactions.date},'YYYY') like ${year} and ${sellTransactions.userId} like ${userId}`
    );

  return totalPurchase[0];
};

export const getDailySellTransactions = async ({
  sellDate,
  userId,
}: {
  sellDate: string;
  userId: string;
}) => {
  const transactions = await db.query.sellTransactions.findMany({
    where: and(
      eq(sellTransactions.userId, userId),
      eq(sellTransactions.date, sellDate)
    ),
    with: {
      products: true,
      customers: true,
    },
    orderBy: desc(sellTransactions.date),
  });
  return transactions as SellTransactionExit[];
};

export const getSellTxByUserProduct = async ({
  userId,
  productId,
}: {
  userId: string;
  productId: string;
}) => {
  const transactions = await db.query.sellTransactions.findMany({
    where: and(
      eq(sellTransactions.userId, userId),
      eq(sellTransactions.productId, productId)
    ),
    with: {
      products: {
        with: {
          unitOfMeasurements: true,
        },
      },
    },
    orderBy: asc(sellTransactions.date),
  });
  return transactions as SellTransactionExit[];
};
