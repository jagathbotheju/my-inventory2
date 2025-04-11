"use server";
import { db } from "@/server/db";
import {
  BuyTransactionExt,
  buyTransactions,
} from "@/server/db/schema/buyTransactions";
import { desc, eq } from "drizzle-orm";

export const getUserBuyTxInvoices = async (userId: string) => {
  const transactions = await db
    .select()
    .from(buyTransactions)
    .where(eq(buyTransactions.userId, userId))
    .orderBy(desc(buyTransactions.date))
    .groupBy(buyTransactions.invoiceNumber, buyTransactions.id);
  // const transactions = await db.query.buyTransactions.findMany({
  //     where: eq(buyTransactions.userId, userId),

  //     with: {
  //       products: {
  //         with: {
  //           unitOfMeasurements: true,
  //         },
  //       },
  //     },
  //   });

  return transactions as BuyTransactionExt[];
};
