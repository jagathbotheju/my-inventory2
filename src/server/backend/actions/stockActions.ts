"use server";
import { db } from "@/server/db";
import { buyTransactions, sellTransactions, stocks } from "@/server/db/schema";
import { Stock, StockExt } from "@/server/db/schema/stocks";
import { and, eq, ne, inArray } from "drizzle-orm";

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

//===STOCKS BY SUPPLIER
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
  });
  return stock as StockExt[];
};

//===All stocks===
export const getAllStocks = async (userId: string) => {
  const stock = await db.query.stocks.findMany({
    where: and(eq(stocks.userId, userId), ne(stocks.quantity, 0)),
  });
  return stock as Stock[];
};

//-QRY-all-user-stocks---helper

//-QRY-all-user-stocks---
export const getAllUserStocks = async ({
  userId,
  searchTerm,
}: {
  userId: string;
  searchTerm: string;
}) => {
  let allUserStocks: StockExt[] = [];

  const userStocks = (await db.query.stocks.findMany({
    where: eq(stocks.userId, userId),
    with: {
      products: {
        with: {
          suppliers: true,
          unitOfMeasurements: true,
        },
      },
    },
  })) as StockExt[];

  let searchStocks: StockExt[] = [];
  if (searchTerm.length) {
    searchStocks = userStocks.filter((stock) =>
      stock.products.productNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }

  allUserStocks = searchTerm.length ? searchStocks : userStocks;
  const allUserStockIds = allUserStocks.map((stock) => stock.productId);

  if (!allUserStocks.length) {
    return [] as StockBal[];
  }

  //buyTxData
  const buyTxs = await db
    .select()
    .from(buyTransactions)
    .where(inArray(buyTransactions.productId, allUserStockIds));

  //sellTxData
  const sellTxs = await db
    .select()
    .from(sellTransactions)
    .where(inArray(sellTransactions.productId, allUserStockIds));

  //stock data
  const stockData = allUserStocks.reduce(
    (acc, stock) => {
      //buyTxData
      const existBuyTxs = buyTxs.filter(
        (item) => item.productId === stock.productId
      );
      const buyTxData = existBuyTxs.reduce(
        (acc, buyTx) => {
          return {
            buyTxTotal: acc.buyTxTotal + buyTx.unitPrice * buyTx.quantity,
            buyTxTotalQuantity: acc.buyTxTotalQuantity + buyTx.quantity,
            buyTxTotalAmount:
              acc.buyTxTotalAmount + buyTx.unitPrice * buyTx.quantity,
          };
        },
        {
          buyTxTotal: 0,
          buyTxTotalQuantity: 0,
          buyTxTotalAmount: 0,
        }
      );

      //sellTxData
      const existSellTxs = sellTxs.filter(
        (item) => item.productId === stock.productId
      );
      const sellTxData = existSellTxs.reduce(
        (acc, sellTx) => {
          return {
            sellTxTotal: acc.sellTxTotal + sellTx.unitPrice * sellTx.quantity,
            sellTxTotalQuantity: acc.sellTxTotalQuantity + sellTx.quantity,
            sellTxTotalAmount:
              acc.sellTxTotalAmount + sellTx.unitPrice * sellTx.quantity,
            sellTxActTotalAmount:
              acc.sellTxActTotalAmount +
              sellTx.purchasedPrice * sellTx.quantity,
          };
        },
        {
          sellTxTotal: 0,
          sellTxTotalQuantity: 0,
          sellTxTotalAmount: 0,
          sellTxActTotalAmount: 0,
        }
      );

      const data = {
        productId: stock.productId,
        productNumber: stock.products.productNumber,
        quantity: stock.quantity,
        uom: stock.products.unitOfMeasurements.unit,
        buyTxTotalQuantity: buyTxData.buyTxTotalQuantity,
        buyTxTotalAmount: buyTxData.buyTxTotalAmount,
        sellTxTotalQuantity: sellTxData.sellTxTotalQuantity,
        sellTxTotalAmount: sellTxData.sellTxTotalAmount,
        sellTxActTotalAmount: sellTxData.sellTxActTotalAmount,
      };

      acc.push(data);
      return acc;
    },
    Array<{
      productId: string;
      productNumber: string;
      quantity: number;
      uom: string;
    }>()
  );

  return stockData as StockBal[];
};
