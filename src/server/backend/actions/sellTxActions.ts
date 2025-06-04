"use server";
import { db } from "@/server/db";
import {
  sellTxCheques,
  sellTxPaymentCheques,
  sellTxPayments,
  stocks,
} from "@/server/db/schema";
import {
  SellMonthHistory,
  sellMonthHistory,
} from "@/server/db/schema/sellMonthHistory";
import {
  SellTransaction,
  SellTransactionExt,
  sellTransactions,
} from "@/server/db/schema/sellTransactions";
import { SellTxPayments } from "@/server/db/schema/sellTxPayments";
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
    //check if transaction exist
    const existTransaction = await db
      .select()
      .from(sellTransactions)
      .where(
        and(
          eq(sellTransactions.userId, data.userId),
          eq(sellTransactions.customerId, data.customerId),
          eq(sellTransactions.supplierId, supplierId),
          eq(sellTransactions.purchasedPrice, data.purchasedPrice ?? 0),
          eq(sellTransactions.productId, data.productId),
          eq(sellTransactions.quantity, data.quantity),
          eq(sellTransactions.unitPrice, data.unitPrice ?? 0),
          eq(sellTransactions.date, data.date)
        )
      );
    if (existTransaction.length) {
      return { error: "Transaction already exist" };
    }

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
    const existStock = await db
      .select()
      .from(stocks)
      .where(
        and(
          eq(stocks.userId, data.userId),
          eq(stocks.productId, data.productId),
          eq(stocks.supplierId, supplierId),
          eq(stocks.unitPrice, data.purchasedPrice ?? 0)
        )
      );

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

export const addSellTransactions = async ({
  sellTxData,
  chequeData,
}: {
  sellTxData: SellTransaction;
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
    //check if transaction exist
    const existTransaction = await db
      .select()
      .from(sellTransactions)
      .where(
        and(
          eq(sellTransactions.productId, sellTxData.productId),
          eq(sellTransactions.quantity, sellTxData.quantity),
          eq(sellTransactions.unitPrice, sellTxData.unitPrice ?? 0),
          eq(sellTransactions.purchasedPrice, sellTxData.purchasedPrice ?? 0),
          eq(sellTransactions.userId, sellTxData.userId),
          eq(sellTransactions.customerId, sellTxData.customerId),
          eq(sellTransactions.supplierId, sellTxData.supplierId as string),
          eq(sellTransactions.date, sellTxData.date),
          eq(sellTransactions.invoiceNumber, sellTxData.invoiceNumber)
        )
      );
    if (existTransaction.length) {
      return { error: "Transaction already exist" };
    }

    const newTransaction = await db
      .insert(sellTransactions)
      .values(sellTxData)
      .returning();

    let newTxPayment = [] as SellTxPayments[];
    if (newTransaction.length) {
      newTxPayment = await db
        .insert(sellTxPayments)
        .values({
          sellTransactionsId: newTransaction[0].id,
          paymentMode: sellTxData.paymentMode,
          cacheAmount: sellTxData.cacheAmount ?? 0,
        })
        .returning();
    }

    if (
      (sellTxData.paymentMode === "cheque" ||
        sellTxData.paymentMode === "cash-cheque") &&
      newTransaction.length &&
      chequeData &&
      chequeData.length
    ) {
      chequeData.map(async (cheque) => {
        await db
          .insert(sellTxCheques)
          .values({
            sellTransactionsId: newTransaction[0].id,
            chequeNumber: cheque.chequeNumber as string,
            bankName: cheque.bankName as string,
            amount: cheque.amount ?? 0,
            chequeDate: cheque.chequeDate?.toDateString(),
          })
          .returning();
      });

      if (newTxPayment.length) {
        chequeData.map(async (cheque) => {
          await db
            .insert(sellTxPaymentCheques)
            .values({
              sellTxPaymentId: newTxPayment[0].id,
              chequeNumber: cheque.chequeNumber as string,
              bankName: cheque.bankName as string,
              amount: cheque.amount ?? 0,
              chequeDate: cheque.chequeDate?.toDateString(),
            })
            .returning();
        });
      }
    }

    const existSellMonthHistory = await db
      .select()
      .from(sellMonthHistory)
      .where(
        and(
          eq(sellMonthHistory.userId, sellTxData.userId),
          eq(sellMonthHistory.day, new Date(sellTxData.date).getDate()),
          eq(sellMonthHistory.month, new Date(sellTxData.date).getMonth() + 1),
          eq(sellMonthHistory.year, new Date(sellTxData.date).getFullYear())
        )
      );
    const existSellYearHistory = await db
      .select()
      .from(sellYearHistory)
      .where(
        and(
          eq(sellYearHistory.userId, sellTxData.userId),
          eq(sellYearHistory.month, new Date(sellTxData.date).getMonth() + 1),
          eq(sellYearHistory.year, new Date(sellTxData.date).getFullYear())
        )
      );

    let monthHistory = [] as SellMonthHistory[];
    let yearHistory = [] as SellYearHistory[];

    if (existSellMonthHistory.length) {
      monthHistory = await db
        .update(sellMonthHistory)
        .set({
          totalPrice:
            sellTxData.quantity * (sellTxData.unitPrice ?? 0) +
            (existSellMonthHistory[0].totalPrice ?? 0),
        })
        .where(
          and(
            eq(sellMonthHistory.userId, sellTxData.userId),
            eq(sellMonthHistory.day, new Date(sellTxData.date).getDate()),
            eq(
              sellMonthHistory.month,
              new Date(sellTxData.date).getMonth() + 1
            ),
            eq(sellMonthHistory.year, new Date(sellTxData.date).getFullYear())
          )
        )
        .returning();
    } else {
      monthHistory = await db
        .insert(sellMonthHistory)
        .values({
          day: new Date(sellTxData.date).getDate(),
          month: new Date(sellTxData.date).getMonth() + 1,
          year: new Date(sellTxData.date).getFullYear(),
          userId: sellTxData.userId,
          totalPrice: sellTxData.quantity * (sellTxData.unitPrice ?? 0),
        })
        .returning();
    }

    if (existSellYearHistory.length) {
      yearHistory = await db
        .update(sellYearHistory)
        .set({
          totalPrice:
            sellTxData.quantity * (sellTxData.unitPrice ?? 0) +
            (existSellYearHistory[0].totalPrice ?? 0),
        })
        .where(
          and(
            eq(sellYearHistory.userId, sellTxData.userId),
            eq(sellYearHistory.month, new Date(sellTxData.date).getMonth() + 1),
            eq(sellYearHistory.year, new Date(sellTxData.date).getFullYear())
          )
        )
        .returning();
    } else {
      yearHistory = await db
        .insert(sellYearHistory)
        .values({
          month: new Date(sellTxData.date).getMonth() + 1,
          year: new Date(sellTxData.date).getFullYear(),
          userId: sellTxData.userId,
          totalPrice: sellTxData.quantity * (sellTxData.unitPrice ?? 0),
        })
        .returning();
    }

    //update stock
    const existStock = await db
      .select()
      .from(stocks)
      .where(
        and(
          eq(stocks.userId, sellTxData.userId),
          eq(stocks.productId, sellTxData.productId),
          eq(stocks.supplierId, sellTxData.supplierId as string),
          eq(stocks.unitPrice, sellTxData.purchasedPrice ?? 0)
        )
      );

    const updatedStock = await db
      .update(stocks)
      .set({
        quantity: existStock[0].quantity - sellTxData.quantity,
      })
      .where(
        and(
          eq(stocks.userId, sellTxData.userId),
          eq(stocks.productId, sellTxData.productId),
          eq(stocks.supplierId, sellTxData.supplierId as string),
          eq(stocks.unitPrice, sellTxData.purchasedPrice ?? 0)
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

// export const addSellTxPayments = async (data: TxPayments) => {
//   try {
//     const cheques = data.cheques;
//     const paymentMode = data.paymentMode;
//     let newCheques = [];
//     // let newPayment = [];

//     const newPayment = await db
//       .insert(sellTxPayments)
//       .values({
//         invoiceNumber: data.invoiceNumber,
//         paymentMode: data.paymentMode,
//         cacheAmount: data.cacheAmount,
//         userId: data.userId,
//       })
//       .returning();
//     console.log("newPayment", newPayment);

//     if (paymentMode === "credit") {
//       return { success: "Payment added successfully" };
//     }

//     if (cheques && cheques.length) {
//       const chequeData = cheques.map((cheque) => ({
//         chequeNumber: cheque.chequeNumber,
//         bankName: cheque.bankName,
//         amount: cheque.amount,
//         chequeData: cheque.chequeDate,
//         userId: data.userId,
//       }));

//       newCheques = await db
//         .insert(sellTxCheques)
//         .values(
//           chequeData.map((cheque) => ({
//             chequeNumber: cheque.chequeNumber,
//             invoiceNumber: data.invoiceNumber,
//             cacheAmount: data.cacheAmount,
//             bankName: cheque.bankName,
//             chequeData: cheque.chequeData,
//           }))
//         )
//         .returning();
//     }
//     if (newPayment.length && newCheques.length) {
//       return { success: "Payment added successfully" };
//     }
//     return { error: "Could not add Payment" };
//   } catch (error) {
//     console.log(error);
//     return { error: "Could not add Payment" };
//   }
// };

export const deleteSellTransaction = async ({
  userId,
  sellTx,
}: {
  userId: string;
  sellTx: SellTransactionExt;
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

    //update sellTxPayments
    // await db
    //   .delete(sellTxPayments)
    //   .where(
    //     and(
    //       eq(sellTxPayments.userId, userId),
    //       eq(sellTxPayments.invoiceNumber, sellTx.invoiceNumber)
    //     )
    //   )
    //   .returning();
    // await db
    //   .delete(sellTxCheques)
    //   .where(
    //     and(
    //       eq(sellTxCheques.userId, userId),
    //       eq(sellTxCheques.invoiceNumber, sellTx.invoiceNumber)
    //     )
    //   )
    //   .returning();

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
    orderBy: desc(sellTransactions.date),
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });
  return transactions as SellTransactionExt[];
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
  return transactions as SellTransactionExt[];
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
  return transactions as SellTransactionExt[];
};

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
        },
      },
      customers: true,
      sellTxCheques: true,
      sellTxPayments: {
        with: {
          sellTxPaymentCheques: true,
        },
      },
    },
  });

  return transactions as SellTransactionExt[];
};
