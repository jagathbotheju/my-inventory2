"use server";
import { db } from "@/server/db";
import { stocks } from "@/server/db/schema";
import { Stock } from "@/server/db/schema/stocks";
import { and, eq } from "drizzle-orm";

export const getStocks = async ({
  userId,
  productId,
  supplierId,
}: {
  userId: string;
  productId: string;
  supplierId: string;
}) => {
  const stock = await db.query.buyTransactions.findMany({
    where: and(
      eq(stocks.userId, userId),
      eq(stocks.productId, productId),
      eq(stocks.supplierId, supplierId)
    ),
  });
  return stock as Stock[];
};

export const getAllStocks = async (userId: string) => {
  const stock = await db.query.stocks.findMany({
    where: eq(stocks.userId, userId),
  });
  return stock as Stock[];
};
