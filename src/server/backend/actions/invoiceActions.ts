"use server";
import { db } from "@/server/db";
import { z } from "zod";
import { BuyProductsSchema } from "@/lib/schema";
import { buyMonthHistory } from "@/server/db/schema/buyMonthHistory";
import { buyYearHistory } from "@/server/db/schema/buyYearHistory";
import { BuyTxInvoice } from "@/server/db/schema/buyTxInvoices";
import { desc, eq, sql, and } from "drizzle-orm";
import {
  buyTransactions,
  buyTxInvoices,
  buyTxPayments,
  sellTxInvoices,
  sellTxPaymentCheques,
  sellTxPayments,
  stocks,
} from "@/server/db/schema";
import { SellTxInvoice } from "@/server/db/schema/sellTxInvoices";
import { SellTxPaymentCheques } from "@/server/db/schema/sellTxPaymentCheques";
import {
  buyTxPaymentCheques,
  BuyTxPaymentCheques,
} from "@/server/db/schema/buyTxPaymentCheques";
import _ from "lodash";

//==MUT addBuyTxInvoice===
export const addBuyTxInvoice = async ({
  formData,
  userId,
  supplierId,
}: {
  formData: z.infer<typeof BuyProductsSchema>;
  userId: string;
  supplierId: string;
}) => {
  try {
    //new invoice
    const existInvoice = await db
      .select()
      .from(buyTxInvoices)
      .where(
        and(
          eq(buyTxInvoices.userId, userId),
          eq(buyTxInvoices.invoiceNumber, formData.invoiceNumber)
        )
      );
    if (existInvoice.length) {
      return {
        error: "Invoice number already exist, please use different Number",
      };
    }
    const totalAmount = formData.products.reduce(
      (acc, item) => (acc += item.quantity * item.unitPrice),
      0
    );
    const newInvoice = await db
      .insert(buyTxInvoices)
      .values({
        userId,
        invoiceNumber: formData.invoiceNumber.trim(),
        totalAmount,
        date: new Date(formData.date).toISOString(),
      })
      .returning();
    if (!newInvoice.length) {
      console.log("***newInvoice Error");
      return {
        error: "Could not Buy Products",
      };
    }

    //new buyTransactions
    const transactions = formData.products.map((item) => {
      return {
        userId,
        productId: item.productId as string,
        invoiceId: newInvoice[0].id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      };
    });
    const newTransactions = await db
      .insert(buyTransactions)
      .values(transactions)
      .returning();
    if (!newTransactions.length) {
      //undo changes
      console.log("***newTransactions Error");
      await db
        .delete(buyTxInvoices)
        .where(eq(buyTxInvoices.id, newInvoice[0].id));
      return {
        error: "Could not Buy Products",
      };
    }

    //new buyTxPayments
    const newBuyTxPayments = await db
      .insert(buyTxPayments)
      .values({
        invoiceId: newInvoice[0].id,
        paymentMode: formData.paymentMode,
        cacheAmount: formData.cacheAmount,
        creditAmount: formData.creditAmount,
      })
      .returning();
    if (!newBuyTxPayments.length) {
      console.log("***newBuyTxPayments Error");
      //undo changes
      await db
        .delete(buyTxInvoices)
        .where(eq(buyTxInvoices.id, newInvoice[0].id));
      await db
        .delete(buyTxPayments)
        .where(eq(buyTxPayments.id, newBuyTxPayments[0].id));
      return {
        error: "Could not Buy Products",
      };
    }

    //new buyTxPaymentCheques
    if (formData.cheques && formData.cheques[0].bankName) {
      const cheques = formData.cheques?.map((item) => {
        return {
          buyTxPaymentId: newBuyTxPayments[0].id,
          chequeNumber: item.chequeNumber as string,
          bankName: item.bankName as string,
          amount: item.amount ?? 0,
          checkDate: item.chequeDate
            ? item.chequeDate.toISOString()
            : new Date().toISOString(),
        };
      });
      const newBuyTxPaymentCheques = await db
        .insert(buyTxPaymentCheques)
        .values(cheques)
        .returning();
      if (!newBuyTxPaymentCheques.length) {
        //undo changes
        console.log("***newBuyTxPaymentCheques Error");
        await db
          .delete(buyTxInvoices)
          .where(eq(buyTxInvoices.id, newInvoice[0].id));
        await db
          .delete(buyTxPayments)
          .where(eq(buyTxPayments.id, newBuyTxPayments[0].id));
        await db
          .delete(buyTxPaymentCheques)
          .where(eq(buyTxPaymentCheques.id, newBuyTxPaymentCheques[0].id));
        return {
          error: "Could not Buy Products",
        };
      }
    }

    //update buyMonthHistory
    const existBuyMonthHistory = await db
      .select()
      .from(buyMonthHistory)
      .where(
        and(
          eq(buyMonthHistory.userId, userId),
          eq(buyMonthHistory.day, new Date(formData.date).getDate()),
          eq(buyMonthHistory.month, new Date(formData.date).getMonth() + 1),
          eq(buyMonthHistory.year, new Date(formData.date).getFullYear())
        )
      );
    if (existBuyMonthHistory.length) {
      const monthHistory = await db
        .update(buyMonthHistory)
        .set({
          totalPrice: totalAmount + (existBuyMonthHistory[0].totalPrice ?? 0),
        })
        .where(
          and(
            eq(buyMonthHistory.userId, userId),
            eq(buyMonthHistory.day, new Date(formData.date).getDate()),
            eq(buyMonthHistory.month, new Date(formData.date).getMonth() + 1),
            eq(buyMonthHistory.year, new Date(formData.date).getFullYear())
          )
        )
        .returning();
      if (!monthHistory) console.log("monthHistoryUpdateError");
    } else {
      const monthHistory = await db
        .insert(buyMonthHistory)
        .values({
          day: new Date(formData.date).getDate(),
          month: new Date(formData.date).getMonth() + 1,
          year: new Date(formData.date).getFullYear(),
          userId: userId,
          totalPrice: totalAmount,
        })
        .returning();
      if (!monthHistory) console.log("monthHistoryInsertError");
    }

    //update buyYearHistory
    const existBuyYearHistory = await db
      .select()
      .from(buyYearHistory)
      .where(
        and(
          eq(buyYearHistory.userId, userId),
          eq(buyYearHistory.month, new Date(formData.date).getMonth() + 1),
          eq(buyYearHistory.year, new Date(formData.date).getFullYear())
        )
      );
    if (existBuyYearHistory.length) {
      const yearHistory = await db
        .update(buyYearHistory)
        .set({
          totalPrice: totalAmount + (existBuyYearHistory[0].totalPrice ?? 0),
        })
        .where(
          and(
            eq(buyYearHistory.userId, userId),
            eq(buyYearHistory.month, new Date(formData.date).getMonth() + 1),
            eq(buyYearHistory.year, new Date(formData.date).getFullYear())
          )
        )
        .returning();
      if (!yearHistory) console.log("yearHistoryUpdateError");
    } else {
      const yearHistory = await db
        .insert(buyYearHistory)
        .values({
          userId: userId,
          month: new Date(formData.date).getMonth() + 1,
          year: new Date(formData.date).getFullYear(),
          totalPrice: totalAmount,
        })
        .returning();
      if (!yearHistory) console.log("yearHistoryInsertError");
    }

    //update Stock
    console.log("formData product", formData.products);
    formData.products.map(async (item) => {
      console.log("updating stocks....", item.quantity);
      db.select()
        .from(stocks)
        .where(
          and(
            eq(stocks.userId, userId),
            eq(stocks.productId, item.productId as string)
          )
        )
        .then(async (product) => {
          if (product.length) {
            console.log("inserting quantity", item.quantity);
            const newStock = await db
              .update(stocks)
              .set({
                quantity: sql`${stocks.quantity} + ${item.quantity}`,
              })
              .where(
                and(
                  eq(stocks.userId, userId),
                  eq(stocks.productId, product[0].productId)
                )
              )
              .returning();

            if (!newStock.length)
              console.log("update newStock Error***", newStock);
          } else {
            const newStock = await db
              .insert(stocks)
              .values({
                userId,
                productId: item.productId as string,
                supplierId,
                quantity: item.quantity,
              })
              .returning();
            if (!newStock.length) console.log("newStock Error***");
          }
        });
    });

    return { success: "Purchase Successful" };
  } catch (error) {
    console.log("Error addBuyTxInvoice", error);
    return { error: "Could not Buy Products" };
  }
};

//=====================================================================================================================
//Add SellTx Payment-ok
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
      totalAmount: sql`${sellTxInvoices.totalAmount} + ${cashAmount} + ${chequesAmount}`,
    })
    .where(eq(sellTxInvoices.id, invoiceId))
    .returning();
  if (!updatedInvoice.length) return { error: "Could not add Payment" };

  return { success: "Payment Added" };
};

//Add BuyTx Payment-ok
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
      totalAmount: sql`${buyTxInvoices.totalAmount} + ${cashAmount} + ${chequesAmount}`,
    })
    .where(eq(buyTxInvoices.id, invoiceId))
    .returning();
  if (!updatedInvoice.length) return { error: "Could not add Payment" };

  return { success: "Payment Added" };
};

//Search SellTx Invoices-ok
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

  return invoices as SellTxInvoice[];
};

//Search BuyTx Invoices-ok
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

  return transactions as BuyTxInvoice[];
};

//SellTx Invoices Period-ok
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

  return transactions as SellTxInvoice[];
};

//BuyTx Invoices Period-ok
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

  return transactions as BuyTxInvoice[];
};

//BuyTx due cheques-ok
export const buyTxDueChecks = async (userId: string) => {
  const buyTxInvoices = await db.query.buyTxInvoices.findMany({
    where: eq(buyTransactions.userId, userId),
    with: {
      buyTxPayments: {
        with: {
          buyTxPaymentCheques: true,
        },
      },
    },
  });
  if (buyTxInvoices.length === 0) return [];

  const cheques = [] as BuyTxCurrentCheques[];

  const payment = buyTxInvoices[0].buyTxPayments;
  if (
    payment?.paymentMode === "cheque" ||
    payment?.paymentMode === "cash-cheque"
  ) {
    payment.buyTxPaymentCheques.map((cheque) => {
      if (cheque.chequeDate && new Date(cheque.chequeDate) >= new Date()) {
        cheques.push({
          ...cheque,
          invoiceNumber: buyTxInvoices[0].invoiceNumber,
        });
      }
    });
  }

  return _.sortBy(cheques, "chequeDate") as BuyTxCurrentCheques[];
};
