"use server";

import { db } from "@/server/db";
import {
  buyTxInvoices,
  buyTxPaymentCheques,
  buyTxPayments,
  stocks,
} from "@/server/db/schema";
import {
  BuyMonthHistory,
  buyMonthHistory,
} from "@/server/db/schema/buyMonthHistory";
import {
  BuyTransaction,
  BuyTransactionExt,
  buyTransactions,
} from "@/server/db/schema/buyTransactions";
import {
  BuyYearHistory,
  buyYearHistory,
} from "@/server/db/schema/buyYearHistory";
import { and, asc, count, desc, eq, sql, sum } from "drizzle-orm";

//GET DAILY BUY TRANSACTIONS
export const getDailyBuyTransactions = async ({
  buyDate,
  userId,
}: {
  buyDate: string;
  userId: string;
}) => {
  const transactions = await db.query.buyTransactions.findMany({
    where: and(
      eq(buyTransactions.userId, userId),
      eq(buyTransactions.date, buyDate)
    ),
    with: {
      products: true,
      suppliers: true,
    },
    orderBy: desc(buyTransactions.date),
  });
  return transactions as BuyTransactionExt[];
};

//ADD SELL TXS
export const addBuyTransactions = async ({
  buyTxData,
  chequeData,
}: {
  buyTxData: BuyTransaction[];
  chequeData:
    | {
        chequeNumber?: string | undefined;
        chequeDate?: Date | undefined;
        bankName?: string | undefined;
        amount?: number | undefined;
      }[]
    | undefined;
}) => {
  try {
    if (!buyTxData.length) return { error: "Could not add Buy Transactions" };

    //total cash
    let totalCash = 0;
    if (buyTxData[0].paymentMode === "cash") {
      totalCash += buyTxData[0].cacheAmount ?? 0;
    }
    if (buyTxData[0].paymentMode === "cheque") {
      chequeData?.map((cheque) => {
        totalCash += cheque.amount ?? 0;
      });
    }
    if (buyTxData[0].paymentMode === "cash-cheque") {
      chequeData?.map((cheque) => {
        totalCash += cheque.amount ?? 0;
      });
      totalCash += buyTxData[0].cacheAmount ?? 0;
    }

    const existInvoice = await db.query.buyTxInvoices.findFirst({
      where: eq(
        buyTxInvoices.invoiceNumber,
        buyTxData[0].invoiceNumber as string
      ),
    });

    //invoice
    let invoice = [];
    if (existInvoice) {
      invoice = await db
        .update(buyTxInvoices)
        .set({
          totalCash: sql`${buyTxInvoices.totalCash} + ${totalCash}`,
        })
        .where(
          eq(buyTxInvoices.invoiceNumber, buyTxData[0].invoiceNumber as string)
        )
        .returning();
    } else {
      invoice = await db
        .insert(buyTxInvoices)
        .values({
          userId: buyTxData[0].userId,
          invoiceNumber: buyTxData[0].invoiceNumber as string,
          date: buyTxData[0].date,
          totalCash,
        })
        .returning();
    }

    if (!invoice.length) return { error: "Could not add Buy Transactions" };

    const sellTxDataWithInvoiceIds = buyTxData.map((item) => ({
      ...item,
      invoiceId: invoice[0].id,
    })) as BuyTransaction[];

    //new transactions
    const newTransaction = await db
      .insert(buyTransactions)
      .values(sellTxDataWithInvoiceIds)
      .returning();

    if (!newTransaction.length)
      return { error: "Could not add Buy Transactions" };

    //new payment
    const newTxPayment = await db
      .insert(buyTxPayments)
      .values({
        invoiceId: invoice[0].id,
        paymentMode: buyTxData[0].paymentMode,
        cacheAmount: buyTxData[0].cacheAmount ?? 0,
        creditAmount: buyTxData[0].creditAmount ?? 0,
      })
      .returning();

    if (!newTxPayment.length)
      return { error: "Could not add Buy Transactions" };

    if (
      (buyTxData[0].paymentMode === "cheque" ||
        buyTxData[0].paymentMode === "cash-cheque") &&
      chequeData &&
      chequeData.length
    ) {
      chequeData.map(async (cheque) => {
        await db
          .insert(buyTxPaymentCheques)
          .values({
            buyTxPaymentId: newTxPayment[0].id,
            chequeNumber: cheque.chequeNumber as string,
            bankName: cheque.bankName as string,
            amount: cheque.amount ?? 0,
            chequeDate: cheque.chequeDate?.toDateString(),
          })
          .returning();
      });
    }

    //history
    const existSellMonthHistory = await db
      .select()
      .from(buyMonthHistory)
      .where(
        and(
          eq(buyMonthHistory.userId, buyTxData[0].userId),
          eq(buyMonthHistory.day, new Date(buyTxData[0].date).getDate()),
          eq(buyMonthHistory.month, new Date(buyTxData[0].date).getMonth() + 1),
          eq(buyMonthHistory.year, new Date(buyTxData[0].date).getFullYear())
        )
      );
    const existSellYearHistory = await db
      .select()
      .from(buyYearHistory)
      .where(
        and(
          eq(buyYearHistory.userId, buyTxData[0].userId),
          eq(buyYearHistory.month, new Date(buyTxData[0].date).getMonth() + 1),
          eq(buyYearHistory.year, new Date(buyTxData[0].date).getFullYear())
        )
      );

    let monthHistory = [] as BuyMonthHistory[];
    let yearHistory = [] as BuyYearHistory[];

    if (existSellMonthHistory.length) {
      monthHistory = await db
        .update(buyMonthHistory)
        .set({
          totalPrice:
            buyTxData[0].quantity * (buyTxData[0].unitPrice ?? 0) +
            (existSellMonthHistory[0].totalPrice ?? 0),
        })
        .where(
          and(
            eq(buyMonthHistory.userId, buyTxData[0].userId),
            eq(buyMonthHistory.day, new Date(buyTxData[0].date).getDate()),
            eq(
              buyMonthHistory.month,
              new Date(buyTxData[0].date).getMonth() + 1
            ),
            eq(buyMonthHistory.year, new Date(buyTxData[0].date).getFullYear())
          )
        )
        .returning();
    } else {
      monthHistory = await db
        .insert(buyMonthHistory)
        .values({
          day: new Date(buyTxData[0].date).getDate(),
          month: new Date(buyTxData[0].date).getMonth() + 1,
          year: new Date(buyTxData[0].date).getFullYear(),
          userId: buyTxData[0].userId,
          totalPrice: buyTxData[0].quantity * (buyTxData[0].unitPrice ?? 0),
        })
        .returning();
    }

    if (existSellYearHistory.length) {
      yearHistory = await db
        .update(buyYearHistory)
        .set({
          totalPrice:
            buyTxData[0].quantity * (buyTxData[0].unitPrice ?? 0) +
            (existSellYearHistory[0].totalPrice ?? 0),
        })
        .where(
          and(
            eq(buyYearHistory.userId, buyTxData[0].userId),
            eq(
              buyYearHistory.month,
              new Date(buyTxData[0].date).getMonth() + 1
            ),
            eq(buyYearHistory.year, new Date(buyTxData[0].date).getFullYear())
          )
        )
        .returning();
    } else {
      yearHistory = await db
        .insert(buyYearHistory)
        .values({
          month: new Date(buyTxData[0].date).getMonth() + 1,
          year: new Date(buyTxData[0].date).getFullYear(),
          userId: buyTxData[0].userId,
          totalPrice: buyTxData[0].quantity * (buyTxData[0].unitPrice ?? 0),
        })
        .returning();
    }

    //update stock
    // const updatedStock = [] as Stock[];
    buyTxData.map(async (item) => {
      const existStock = await db
        .select()
        .from(stocks)
        .where(
          and(
            eq(stocks.userId, item.userId),
            eq(stocks.productId, item.productId),
            eq(stocks.supplierId, item.supplierId as string)
          )
        );

      await db
        .update(stocks)
        .set({
          quantity: existStock[0].quantity + item.quantity,
        })
        .where(
          and(
            eq(stocks.userId, item.userId),
            eq(stocks.productId, item.productId),
            eq(stocks.supplierId, item.supplierId as string)
          )
        )
        .returning();
    });

    if (
      newTransaction.length &&
      monthHistory.length &&
      yearHistory.length
      // updatedStock.length
    ) {
      return { success: "Buy Transaction added successfully" };
    }

    return { error: "Count not add Transaction" };
  } catch (error) {
    console.log(error);
    return { error: "Count not add Transaction" };
  }
};

//===ADD BUY TRANSACTION===
export const addBuyTransaction = async (data: BuyTransaction) => {
  try {
    //existTransaction
    const existTransaction = await db
      .select()
      .from(buyTransactions)
      .where(
        and(
          eq(buyTransactions.userId, data.userId),
          eq(buyTransactions.supplierId, data.supplierId),
          eq(buyTransactions.productId, data.productId),
          eq(buyTransactions.quantity, data.quantity),
          eq(buyTransactions.unitPrice, data.unitPrice),
          eq(buyTransactions.date, data.date)
        )
      );
    if (existTransaction.length) {
      return { error: "Transaction already exist" };
    }

    const existBuyMonthHistory = await db
      .select()
      .from(buyMonthHistory)
      .where(
        and(
          eq(buyMonthHistory.userId, data.userId),
          eq(buyMonthHistory.day, new Date(data.date).getDate()),
          eq(buyMonthHistory.month, new Date(data.date).getMonth() + 1),
          eq(buyMonthHistory.year, new Date(data.date).getFullYear())
        )
      );

    const existBuyYearHistory = await db
      .select()
      .from(buyYearHistory)
      .where(
        and(
          eq(buyYearHistory.userId, data.userId),
          eq(buyYearHistory.month, new Date(data.date).getMonth() + 1),
          eq(buyYearHistory.year, new Date(data.date).getFullYear())
        )
      );

    const existStock = await db
      .select()
      .from(stocks)
      .where(
        and(
          eq(stocks.userId, data.userId),
          eq(stocks.supplierId, data.supplierId),
          eq(stocks.productId, data.productId)
        )
      );

    //transactions
    await db.transaction(async (tx) => {
      //new buyTransaction
      await tx.insert(buyTransactions).values(data).returning();

      // update buyMonthHistory
      if (existBuyMonthHistory.length) {
        await tx
          .update(buyMonthHistory)
          .set({
            totalPrice:
              data.quantity * (data.unitPrice ?? 0) +
              (existBuyMonthHistory[0].totalPrice ?? 0),
          })
          .where(
            and(
              eq(buyMonthHistory.userId, data.userId),
              eq(buyMonthHistory.day, new Date(data.date).getDate()),
              eq(buyMonthHistory.month, new Date(data.date).getMonth() + 1),
              eq(buyMonthHistory.year, new Date(data.date).getFullYear())
            )
          )
          .returning();
      } else {
        await tx
          .insert(buyMonthHistory)
          .values({
            day: new Date(data.date).getDate(),
            month: new Date(data.date).getMonth() + 1,
            year: new Date(data.date).getFullYear(),
            userId: data.userId,
            totalPrice: data.quantity * (data.unitPrice ?? 0),
          })
          .returning();
      }

      // update buyYearHistory
      if (existBuyYearHistory.length) {
        await tx
          .update(buyYearHistory)
          .set({
            totalPrice:
              data.quantity * (data.unitPrice ?? 0) +
              (existBuyYearHistory[0].totalPrice ?? 0),
          })
          .where(
            and(
              eq(buyYearHistory.userId, data.userId),
              eq(buyYearHistory.month, new Date(data.date).getMonth() + 1),
              eq(buyYearHistory.year, new Date(data.date).getFullYear())
            )
          )
          .returning();
      } else {
        tx.insert(buyYearHistory)
          .values({
            month: new Date(data.date).getMonth() + 1,
            year: new Date(data.date).getFullYear(),
            userId: data.userId,
            totalPrice: data.quantity * (data.unitPrice ?? 0),
          })
          .returning();
      }

      //update stock
      if (existStock.length) {
        await tx
          .update(stocks)
          .set({
            quantity: data.quantity + (existStock[0].quantity ?? 0),
          })
          .where(
            and(
              eq(stocks.userId, data.userId),
              eq(stocks.supplierId, data.supplierId),
              eq(stocks.productId, data.productId)
            )
          )
          .returning();
      } else {
        await tx
          .insert(stocks)
          .values({
            userId: data.userId,
            supplierId: data.supplierId,
            productId: data.productId,
            quantity: data.quantity,
          })
          .returning();
      }
    });

    return { success: "Buy Transaction added successfully" };
  } catch (error) {
    console.log(error);
    return { error: "Count not add Transaction" };
  }
};

//GET BUY TRANSACTIONS PAGINATION
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
  const fSearch = `%${searchTerm}%`;

  if (searchTerm?.length) {
    const transactions = await db.query.buyTransactions.findMany({
      where: sql`${buyTransactions.userId} like ${userId} and ${buyTransactions.invoiceNumber} ilike ${fSearch}`,
      with: {
        products: true,
      },
      orderBy: desc(buyTransactions.date),
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });
    return transactions as BuyTransactionExt[];
  } else {
    const transactions = await db.query.buyTransactions.findMany({
      where:
        timeFrame === "month"
          ? sql`to_char(${buyTransactions.date},'MM') like ${month} and to_char(${buyTransactions.date},'YYYY') like ${year} and ${buyTransactions.userId} like ${userId}`
          : sql`to_char(${buyTransactions.date},'YYYY') like ${year} and ${buyTransactions.userId} like ${userId}`,
      with: {
        products: true,
      },
      orderBy: desc(buyTransactions.date),
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });
    return transactions as BuyTransactionExt[];
  }
};

//UPDATE BUY TRANSACTION
export const deleteBuyTransaction = async ({
  userId,
  buyTx,
}: {
  userId: string;
  buyTx: BuyTransactionExt;
}) => {
  try {
    const deletedTx = await db
      .delete(buyTransactions)
      .where(
        and(
          eq(buyTransactions.id, buyTx.id),
          eq(buyTransactions.userId, userId)
        )
      )
      .returning();

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

    // let monthHistory = [] as BuyMonthHistory[];
    // let yearHistory = [] as BuyYearHistory[];
    const deletedTxTotalPrice =
      deletedTx[0].quantity * (deletedTx[0].unitPrice ?? 0);
    const existMonthHistoryTotalPrice = existBuyMonthHistory[0].totalPrice ?? 0;
    const existYearHistoryTotalPrice = existBuyMonthHistory[0].totalPrice ?? 0;

    // update month history
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
        )
        .returning();
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
        )
        .returning();
    }

    // update year history
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
        )
        .returning();
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
        )
        .returning();
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

//GET BUY TX YEARS
export const getBuyTxYears = async () => {
  const years = await db
    .selectDistinctOn([buyYearHistory.year])
    .from(buyYearHistory)
    .orderBy(asc(buyYearHistory.year));

  return years as BuyYearHistory[];
};

//GET BUY TX MONTHS
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

//GET BUY TX TOTAL PURCHASE
export const getByTxTotalPurchase = async ({
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

//GET BUY TX USER
export const getBuyTxByUser = async (userId: string) => {
  const transactions = await db.query.buyTransactions.findMany({
    where: eq(buyTransactions.userId, userId),
    with: {
      products: {
        with: {
          unitOfMeasurements: true,
        },
      },
    },
  });
  return transactions as BuyTransactionExt[];
};

//GET BUY TX BY USER PERIOD
export const getBuyTxByUserByPeriod = async ({
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

  const transactions = await db.query.buyTransactions.findMany({
    where:
      timeFrame === "month"
        ? sql`to_char(${buyTransactions.date},'MM') like ${month} and to_char(${buyTransactions.date},'YYYY') like ${year} and ${buyTransactions.userId} like ${userId} and ${buyTransactions.invoiceNumber} ilike ${fSearch}`
        : sql`to_char(${buyTransactions.date},'YYYY') like ${year} and ${buyTransactions.userId} like ${userId} and ${buyTransactions.invoiceNumber} ilike ${fSearch}`,
  });

  return transactions as BuyTransactionExt[];
};

//GET BUY TX BY USER PRODUCT
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
        },
      },
      suppliers: true,
    },
    orderBy: desc(buyTransactions.date),
  });
  return transactions as BuyTransactionExt[];
};
