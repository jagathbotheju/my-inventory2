"use server";
import { db } from "@/server/db";
import { buyTransactions, sellTransactions, stocks } from "@/server/db/schema";
import { Stock, StockExt } from "@/server/db/schema/stocks";
import { and, asc, eq, ne, sum } from "drizzle-orm";

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
    where: and(eq(stocks.userId, userId), ne(stocks.quantity, 0)),
    orderBy: asc(stocks.productNumber),
  });
  return stock as Stock[];
};

export const getAllUserStocks = async (userId: string) => {
  const buyTxStocks = await db
    .select({
      productNumber: buyTransactions.productNumber,
      productId: buyTransactions.productId,
      quantity: sum(buyTransactions.quantity),
    })
    .from(buyTransactions)
    .groupBy(buyTransactions.productId, buyTransactions.productNumber)
    .where(eq(buyTransactions.userId, userId));

  const sellTxStocks = await db
    .select({
      productId: sellTransactions.productId,
      quantity: sum(sellTransactions.quantity),
    })
    .from(sellTransactions)
    .groupBy(sellTransactions.productId)
    .where(eq(sellTransactions.userId, userId));

  const stockBal = [] as StockBal[];
  buyTxStocks.map((buyTx) => {
    const exist = sellTxStocks.find(
      (item) => item.productId === buyTx.productId
    );
    const buyBal = buyTx.quantity ? +buyTx.quantity : 0;
    const sellBal = exist?.quantity ? +exist.quantity : 0;
    const bal = buyBal - sellBal;
    if (bal !== 0) {
      stockBal.push({
        productNumber: buyTx.productNumber!,
        productId: buyTx.productId,
        quantity: buyBal - sellBal,
      });
    }
  });

  return stockBal as StockBal[];
};
