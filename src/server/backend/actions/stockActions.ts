"use server";
import { db } from "@/server/db";
import { stocks } from "@/server/db/schema";
import { Stock, StockExt } from "@/server/db/schema/stocks";
import { and, asc, eq } from "drizzle-orm";

export const getStocks = async ({
  userId,
  productId,
  supplierId,
}: {
  userId: string;
  productId: string;
  supplierId: string;
}) => {
  const stock = await db.query.stocks.findMany({
    where: and(
      eq(stocks.userId, userId),
      eq(stocks.productId, productId),
      eq(stocks.supplierId, supplierId)
    ),
  });
  return stock as Stock[];
};

export const getStocksBySupplier = async ({
  userId,
  supplierId,
}: {
  userId: string;
  supplierId: string;
}) => {
  const stock = await db.query.stocks.findMany({
    where: and(eq(stocks.userId, userId), eq(stocks.supplierId, supplierId)),
    with: {
      products: {
        with: {
          unitOfMeasurements: true,
          suppliers: true,
        },
      },
    },
    orderBy: asc(stocks.productNumber),
  });
  return stock as StockExt[];
};

export const getAllStocks = async (userId: string) => {
  const stock = await db.query.stocks.findMany({
    where: eq(stocks.userId, userId),
    orderBy: asc(stocks.productNumber),
  });
  return stock as Stock[];
};
