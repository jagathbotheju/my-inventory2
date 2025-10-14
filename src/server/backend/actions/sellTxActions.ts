"use server";
import { db } from "@/server/db";
import { stocks } from "@/server/db/schema";
import { sellMonthHistory } from "@/server/db/schema/sellMonthHistory";
import {
  SellTransactionExt,
  sellTransactions,
} from "@/server/db/schema/sellTransactions";
import { sellTxInvoices } from "@/server/db/schema/sellTxInvoices";
import { sellYearHistory } from "@/server/db/schema/sellYearHistory";
import { and, count, desc, eq, gte, lte, sql, sum } from "drizzle-orm";
import _ from "lodash";

//---MUT-delete-sellTx
export const deleteSellTransaction = async ({
  userId,
  sellTx,
}: {
  userId: string;
  sellTx: SellTransactionExt;
}) => {
  try {
    //delete transaction
    const deletedTx = await db
      .delete(sellTransactions)
      .where(
        and(
          eq(sellTransactions.id, sellTx.id),
          eq(sellTransactions.userId, userId)
        )
      )
      .returning();
    console.log("deletedTx", deletedTx);

    if (!deletedTx.length) return { error: "Could not Delete Transaction" };

    const deletedTxTotalPrice =
      deletedTx[0].quantity * (deletedTx[0].unitPrice ?? 0);

    //update invoice
    const existInvoice = await db
      .select()
      .from(sellTxInvoices)
      .where(
        and(
          eq(sellTxInvoices.userId, userId),
          eq(sellTxInvoices.id, deletedTx[0].invoiceId)
        )
      );
    const existInvoiceTotalAmount = existInvoice[0].totalAmount ?? 0;
    if (existInvoice.length && existInvoiceTotalAmount > deletedTxTotalPrice) {
      await db
        .update(sellTxInvoices)
        .set({ totalAmount: existInvoiceTotalAmount - deletedTxTotalPrice })
        .where(eq(sellTxInvoices.id, deletedTx[0].invoiceId));
    } else {
      await db
        .delete(sellTxInvoices)
        .where(eq(sellTxInvoices.id, deletedTx[0].invoiceId));
    }

    // update month history
    const existSellMonthHistory = await db
      .select()
      .from(sellMonthHistory)
      .where(
        and(
          eq(sellMonthHistory.userId, userId),
          eq(sellMonthHistory.day, new Date(deletedTx[0].date).getDate()),
          eq(
            sellMonthHistory.month,
            new Date(deletedTx[0].date).getMonth() + 1
          ),
          eq(sellMonthHistory.year, new Date(deletedTx[0].date).getFullYear())
        )
      );
    console.log("existSellMonthHistory", existSellMonthHistory);
    const existMonthHistoryTotalPrice =
      existSellMonthHistory[0]?.totalPrice ?? 0;
    if (
      existSellMonthHistory.length &&
      existMonthHistoryTotalPrice > deletedTxTotalPrice
    ) {
      const deletedMonthHistory = await db
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
        );
      console.log("deletedMonthHistory", deletedMonthHistory);
    } else {
      const deletedMonthHistory = await db
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
      console.log("deletedMonthHistory", deletedMonthHistory);
    }

    // update year history
    const existBuyYearHistory = await db
      .select()
      .from(sellYearHistory)
      .where(
        and(
          eq(sellYearHistory.userId, deletedTx[0].userId),
          eq(sellYearHistory.month, new Date(deletedTx[0].date).getMonth() + 1),
          eq(sellYearHistory.year, new Date(deletedTx[0].date).getFullYear())
        )
      );
    const existYearHistoryTotalPrice = existBuyYearHistory[0].totalPrice ?? 0;
    if (
      existBuyYearHistory.length &&
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
        );
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
        );
    }

    //update stock
    const existStock = await db
      .select()
      .from(stocks)
      .where(
        and(eq(stocks.userId, userId), eq(stocks.productId, sellTx.productId))
      );
    if (existStock.length) {
      await db
        .update(stocks)
        .set({
          quantity: existStock[0].quantity + deletedTx[0].quantity,
        })
        .where(
          and(eq(stocks.userId, userId), eq(stocks.productId, sellTx.productId))
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

//---QRY-SellTx-pagination
export const getSellTransactionsPagination = async ({
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
  searchTerm: string;
}) => {
  const year = period.year;
  const month =
    period.month.toString().length > 1 ? period.month : `0${period.month}`;
  // const fSearch = `%${searchTerm}%`;

  if (searchTerm?.length) {
    const transactions = await db.query.sellTransactions.findMany({
      where: eq(sellTransactions.userId, userId),
      with: {
        customers: true,
        sellTxInvoices: true,
        products: true,
      },
      orderBy: desc(sellTransactions.date),
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    if (transactions.length) {
      const result = transactions.filter(
        (item) =>
          item.sellTxInvoices.invoiceNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.products.productNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
      return result as SellTransactionExt[];
    }

    return [] as SellTransactionExt[];
  } else {
    const transactions = await db.query.sellTransactions.findMany({
      where:
        timeFrame === "month"
          ? sql`to_char(${sellTransactions.date},'MM') like ${month} and to_char(${sellTransactions.date},'YYYY') like ${year} and ${sellTransactions.userId} like ${userId}`
          : sql`to_char(${sellTransactions.date},'YYYY') like ${year} and ${sellTransactions.userId} like ${userId}`,
      with: {
        customers: true,
        sellTxInvoices: true,
        products: true,
      },
      orderBy: desc(sellTransactions.date),
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    return transactions as SellTransactionExt[];
  }
};

//---QRY-sellTx-total-count
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

//---QRY-SellTx-total-sales--
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

  const totalSales = await db
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

  return totalSales[0];
};

//Daily SellTx
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
  return transactions as SellTransactionExt[];
};

//---SellTx-User-Product---
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
    orderBy: desc(sellTransactions.date),
  });
  return transactions as SellTransactionExt[];
};

//SellTx User Period
export const getSellTxByUserByPeriod = async ({
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

  const transactions = await db.query.sellTransactions.findMany({
    where:
      timeFrame === "month"
        ? sql`to_char(${sellTransactions.date},'MM') like ${month} and to_char(${sellTransactions.date},'YYYY') like ${year} and ${sellTransactions.userId} like ${userId}`
        : sql`to_char(${sellTransactions.date},'YYYY') like ${year} and ${sellTransactions.userId} like ${userId}`,
    with: {
      products: {
        with: {
          unitOfMeasurements: true,
          // suppliers: true,
        },
      },
      sellTxInvoices: {
        with: {
          sellTxPayments: true,
        },
      },
      customers: true,
    },
  });

  return transactions as SellTransactionExt[];
};

//SellTx between dates
export const getSellTxDateRange = async ({
  userId,
  customerId,
  from,
  to,
}: {
  customerId?: string;
  userId: string;
  from: Date;
  to: Date;
}) => {
  const sellTxs = await db.query.sellTransactions.findMany({
    where: customerId
      ? and(
          eq(sellTransactions.userId, userId),
          eq(sellTransactions.customerId, customerId),
          gte(sellTransactions.date, from.toDateString()),
          lte(sellTransactions.date, to.toDateString())
        )
      : and(
          eq(sellTransactions.userId, userId),
          gte(sellTransactions.date, from.toDateString()),
          lte(sellTransactions.date, to.toDateString())
        ),
    with: {
      products: {
        with: {
          unitOfMeasurements: true,
          // suppliers: true,
        },
      },
      sellTxInvoices: {
        with: {
          sellTxPayments: {
            with: {
              sellTxPaymentCheques: true,
            },
          },
        },
      },
      customers: true,
    },
  });

  const fSellTxs = sellTxs.filter(
    (item) => item.customers.name.toLowerCase() !== "cash bill"
  );

  const sortedBuyTxs = _.sortBy(fSellTxs, "customers.name", "date");
  const groupedBuyTxs = _.groupBy(sortedBuyTxs, "customers.name");

  return groupedBuyTxs;
};
