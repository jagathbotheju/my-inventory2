"use server";
import { db } from "@/server/db";
import { buyTransactions, sellTransactions, stocks } from "@/server/db/schema";
import { Stock, StockExt } from "@/server/db/schema/stocks";
import { and, asc, eq, ne, sql } from "drizzle-orm";

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
  const sellTxStocks = await db
    .select({
      productId: sellTransactions.productId,
      quantity: sellTransactions.quantity,
    })
    .from(sellTransactions)
    .where(eq(sellTransactions.userId, userId));

  const sellTxs = sellTxStocks.reduce(
    (acc, sellTx) => {
      const exist = acc.find((item) => item.productId === sellTx.productId);

      if (!exist) {
        acc.push({
          productId: sellTx.productId,
          quantity: sellTx.quantity,
        });
      } else {
        exist.quantity += sellTx.quantity;
      }
      return acc;
    },
    [
      {
        productId: "",
        quantity: 0,
      },
    ]
  );

  const buyTxStocks = await db
    .select({
      productId: buyTransactions.productId,
      productNumber: buyTransactions.productNumber,
      quantity: buyTransactions.quantity,
    })
    .from(buyTransactions)
    .where(eq(buyTransactions.userId, userId));

  const buyTxs = buyTxStocks.reduce(
    (acc, buyTx) => {
      const exist = acc.find((item) => item.productId === buyTx.productId);

      if (!exist) {
        acc.push({
          productId: buyTx.productId,
          productNumber: buyTx.productNumber as string,
          quantity: buyTx.quantity,
        });
      } else {
        exist.quantity += buyTx.quantity;
      }
      return acc;
    },
    [
      {
        productId: "",
        productNumber: "",
        quantity: 0,
      },
    ]
  );

  const stockBal = [] as StockBal[];
  buyTxs.map((buyTx) => {
    const exist = sellTxs.find((item) => item.productId === buyTx.productId);
    const buyBal = +buyTx.quantity;
    const sellBal = exist?.quantity ? +exist.quantity : 0;
    const bal = buyBal - sellBal;
    if (bal !== 0) {
      stockBal.push({
        productNumber: buyTx.productNumber,
        productId: buyTx.productId,
        quantity: buyBal - sellBal,
      });
    }
  });

  return stockBal as StockBal[];
};

export const searchStocks = async ({
  userId,
  searchTerm,
}: {
  userId: string;
  searchTerm: string;
}) => {
  const fSearch = `%${searchTerm}%`;

  const sellTxStocks = await db
    .select({
      productId: sellTransactions.productId,
      quantity: sellTransactions.quantity,
      productNumber: sellTransactions.productNumber,
    })
    .from(sellTransactions)
    .where(
      sql`${sellTransactions.userId} like ${userId} and ${sellTransactions.productNumber} ilike ${fSearch}`
    );
  // console.log("searchStocks sellTxStocks", sellTxStocks);

  const sellTxs = sellTxStocks.reduce(
    (acc, sellTx) => {
      const exist = acc.find((item) => item.productId === sellTx.productId);

      if (!exist) {
        acc.push({
          productId: sellTx.productId,
          quantity: sellTx.quantity,
        });
      } else {
        exist.quantity += sellTx.quantity;
      }
      return acc;
    },
    [
      {
        productId: "",
        quantity: 0,
      },
    ]
  );

  const buyTxStocks = await db
    .select({
      productId: buyTransactions.productId,
      productNumber: buyTransactions.productNumber,
      quantity: buyTransactions.quantity,
    })
    .from(buyTransactions)
    .where(
      sql`${buyTransactions.userId} like ${userId} and ${buyTransactions.productNumber} ilike ${fSearch}`
    );

  const buyTxs = buyTxStocks.reduce(
    (acc, buyTx) => {
      const exist = acc.find((item) => item.productId === buyTx.productId);

      if (!exist) {
        acc.push({
          productId: buyTx.productId,
          productNumber: buyTx.productNumber as string,
          quantity: buyTx.quantity,
        });
      } else {
        exist.quantity += buyTx.quantity;
      }
      return acc;
    },
    [
      {
        productId: "",
        productNumber: "",
        quantity: 0,
      },
    ]
  );

  const stockBal = [] as StockBal[];
  buyTxs.map((buyTx) => {
    const exist = sellTxs.find((item) => item.productId === buyTx.productId);
    const buyBal = +buyTx.quantity;
    const sellBal = exist?.quantity ? +exist.quantity : 0;
    const bal = buyBal - sellBal;
    if (bal !== 0) {
      stockBal.push({
        productNumber: buyTx.productNumber,
        productId: buyTx.productId,
        quantity: buyBal - sellBal,
      });
    }
  });

  // console.log("stockBal", stockBal);

  return stockBal as StockBal[];
};

export const getAllUserStocksByPeriod = async ({
  userId,
  period,
  timeFrame,
}: {
  userId: string;
  period: Period;
  timeFrame: TimeFrame | "all";
}) => {
  const year = period.year;
  const month =
    period.month.toString().length > 1 ? period.month : `0${period.month}`;

  const sellTxStocks = await db
    .select({
      productId: sellTransactions.productId,
      quantity: sellTransactions.quantity,
    })
    .from(sellTransactions)
    .where(
      timeFrame === "all"
        ? eq(sellTransactions.userId, userId)
        : timeFrame === "month"
        ? sql`to_char(${sellTransactions.date},'MM') like ${month} 
              and to_char(${sellTransactions.date},'YYYY') like ${year} 
              and ${sellTransactions.userId} like ${userId}`
        : sql`to_char(${sellTransactions.date},'YYYY') like ${year} 
              and ${sellTransactions.userId} like ${userId}`
    );

  const sellTxs = sellTxStocks.reduce(
    (acc, sellTx) => {
      const exist = acc.find((item) => item.productId === sellTx.productId);

      if (!exist) {
        acc.push({
          productId: sellTx.productId,
          quantity: sellTx.quantity,
        });
      } else {
        exist.quantity += sellTx.quantity;
      }
      return acc;
    },
    [
      {
        productId: "",
        quantity: 0,
      },
    ]
  );

  const buyTxStocks = await db
    .select({
      productId: buyTransactions.productId,
      productNumber: buyTransactions.productNumber,
      quantity: buyTransactions.quantity,
    })
    .from(buyTransactions)
    .where(
      timeFrame === "all"
        ? eq(buyTransactions.userId, userId)
        : timeFrame === "month"
        ? sql`to_char(${buyTransactions.date},'MM') like ${month} 
              and to_char(${buyTransactions.date},'YYYY') like ${year} 
              and ${buyTransactions.userId} like ${userId}`
        : sql`to_char(${buyTransactions.date},'YYYY') like ${year} 
              and ${buyTransactions.userId} like ${userId}`
    );

  const buyTxs = buyTxStocks.reduce(
    (acc, buyTx) => {
      const exist = acc.find((item) => item.productId === buyTx.productId);

      if (!exist) {
        acc.push({
          productId: buyTx.productId,
          productNumber: buyTx.productNumber as string,
          quantity: buyTx.quantity,
        });
      } else {
        exist.quantity += buyTx.quantity;
      }
      return acc;
    },
    [
      {
        productId: "",
        productNumber: "",
        quantity: 0,
      },
    ]
  );

  const stockBal = [] as StockBal[];
  buyTxs.map((buyTx) => {
    const exist = sellTxs.find((item) => item.productId === buyTx.productId);
    const buyBal = +buyTx.quantity;
    const sellBal = exist?.quantity ? +exist.quantity : 0;
    const bal = buyBal - sellBal;
    if (bal !== 0) {
      stockBal.push({
        productNumber: buyTx.productNumber,
        productId: buyTx.productId,
        quantity: buyBal - sellBal,
      });
    }
  });

  // console.log("stockBal", stockBal);

  return stockBal as StockBal[];
};
