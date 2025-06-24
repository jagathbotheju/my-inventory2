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

//====ALL STOCKS
export const getAllUserStocks = async (userId: string) => {
  //SELL TXS
  const sellTxs = await db
    .select()
    .from(sellTransactions)
    .where(eq(sellTransactions.userId, userId));

  //SELL TX STOCKS
  const sellTxStocks = sellTxs.reduce(
    (acc, sellTx) => {
      const exist = acc.find((item) => item.productId === sellTx.productId);

      if (!exist) {
        acc.push({
          productId: sellTx.productId,
          quantity: sellTx.quantity,
          sellTxTotalAmount: (sellTx.unitPrice ?? 0) * sellTx.quantity,
        });
      } else {
        exist.quantity += sellTx.quantity;
        exist.sellTxTotalAmount += (sellTx.unitPrice ?? 0) * sellTx.quantity;
      }
      return acc;
    },
    [
      {
        productId: "",
        quantity: 0,
        sellTxTotalAmount: 0,
      },
    ]
  );

  //BUY TXS
  const buyTxs = await db.query.buyTransactions.findMany({
    where: eq(buyTransactions.userId, userId),
    with: {
      products: {
        with: {
          unitOfMeasurements: true,
        },
      },
    },
  });

  //BUY TX STOCKS
  const buyTxStocks = buyTxs.reduce(
    (acc, buyTx) => {
      const exist = acc.find((item) => item.productId === buyTx.productId);

      if (!exist) {
        acc.push({
          productId: buyTx.productId,
          productNumber: buyTx.productNumber as string,
          quantity: buyTx.quantity,
          buyTxTotalAmount: buyTx.unitPrice * buyTx.quantity,
          uom: buyTx.products.unitOfMeasurements.unit,
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
        buyTxTotalAmount: 0,
        uom: "",
      },
    ]
  );

  //STOCK BAL
  const stockBal = [] as StockBal[];
  buyTxStocks.map((buyTx) => {
    const exist = sellTxStocks.find(
      (item) => item.productId === buyTx.productId
    );
    const buyBal = +buyTx.quantity;
    const sellBal = exist?.quantity ? +exist.quantity : 0;
    const bal = buyBal - sellBal;
    if (bal !== 0) {
      stockBal.push({
        productNumber: buyTx.productNumber,
        productId: buyTx.productId,
        quantity: buyBal - sellBal,
        buyTxTotalQuantity: buyTx.quantity,
        buyTxTotalAmount: buyTx.buyTxTotalAmount,
        sellTxTotalQuantity: exist?.quantity ?? 0,
        sellTxTotalAmount: exist?.sellTxTotalAmount ?? 0,
        uom: buyTx.uom,
      });
    }
  });

  return stockBal as StockBal[];
};

//====SEARCH STOCKS
export const searchStocks = async ({
  userId,
  searchTerm,
}: {
  userId: string;
  searchTerm: string;
}) => {
  const fSearch = `%${searchTerm}%`;

  //SELL TXS
  const sellTxs = await db
    .select()
    .from(sellTransactions)
    .where(
      sql`${sellTransactions.userId} like ${userId} and ${sellTransactions.productNumber} ilike ${fSearch}`
    );

  //SELL TX STOCKS
  const sellTxStocks = sellTxs.reduce(
    (acc, sellTx) => {
      const exist = acc.find((item) => item.productId === sellTx.productId);

      if (!exist) {
        acc.push({
          productId: sellTx.productId,
          quantity: sellTx.quantity,
          sellTxTotalAmount: (sellTx.unitPrice ?? 0) * sellTx.quantity,
        });
      } else {
        exist.quantity += sellTx.quantity;
        exist.sellTxTotalAmount += (sellTx.unitPrice ?? 0) * sellTx.quantity;
      }
      return acc;
    },
    [
      {
        productId: "",
        quantity: 0,
        sellTxTotalAmount: 0,
      },
    ]
  );

  //BUY TXS
  const buyTxs = await db.query.buyTransactions.findMany({
    where: sql`${buyTransactions.userId} like ${userId} and ${buyTransactions.productNumber} ilike ${fSearch}`,
    with: {
      products: {
        with: {
          unitOfMeasurements: true,
        },
      },
    },
  });

  //BUY TX STOCKS
  const buyTxStocks = buyTxs.reduce(
    (acc, buyTx) => {
      const exist = acc.find((item) => item.productId === buyTx.productId);

      if (!exist) {
        acc.push({
          productId: buyTx.productId,
          productNumber: buyTx.productNumber as string,
          quantity: buyTx.quantity,
          buyTxTotalAmount: buyTx.unitPrice * buyTx.quantity,
          uom: buyTx.products.unitOfMeasurements.unit,
        });
      } else {
        exist.quantity += buyTx.quantity;
        exist.buyTxTotalAmount += buyTx.unitPrice * buyTx.quantity;
      }
      return acc;
    },
    [
      {
        productId: "",
        productNumber: "",
        quantity: 0,
        buyTxTotalAmount: 0,
        uom: "",
      },
    ]
  );

  //STOCK BAL
  const stockBal = [] as StockBal[];
  buyTxStocks.map((buyTx) => {
    const exist = sellTxStocks.find(
      (item) => item.productId === buyTx.productId
    );
    const buyBal = +buyTx.quantity;
    const sellBal = exist?.quantity ? +exist.quantity : 0;
    const bal = buyBal - sellBal;
    if (bal !== 0) {
      stockBal.push({
        productNumber: buyTx.productNumber,
        productId: buyTx.productId,
        quantity: buyBal - sellBal,
        buyTxTotalQuantity: buyTx.quantity,
        buyTxTotalAmount: buyTx.buyTxTotalAmount,
        sellTxTotalQuantity: exist?.quantity ?? 0,
        sellTxTotalAmount: exist?.sellTxTotalAmount ?? 0,
        uom: buyTx.uom,
      });
    }
  });

  return stockBal as StockBal[];
};

//====ALL STOCKS BY PERIOD
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

  //BUY TXS
  const buyTxs = await db.query.buyTransactions.findMany({
    where:
      timeFrame === "all"
        ? eq(buyTransactions.userId, userId)
        : timeFrame === "month"
        ? sql`to_char(${buyTransactions.date},'MM') like ${month} 
              and to_char(${buyTransactions.date},'YYYY') like ${year} 
              and ${buyTransactions.userId} like ${userId}`
        : sql`to_char(${buyTransactions.date},'YYYY') like ${year} 
              and ${buyTransactions.userId} like ${userId}`,
    with: {
      products: {
        with: {
          unitOfMeasurements: true,
        },
      },
    },
  });

  //BUY TX STOCKS
  const buyTxStocks = buyTxs.reduce(
    (acc, buyTx) => {
      const exist = acc.find((item) => item.productId === buyTx.productId);

      if (!exist) {
        acc.push({
          productId: buyTx.productId,
          productNumber: buyTx.productNumber as string,
          quantity: buyTx.quantity,
          buyTxTotalAmount: buyTx.unitPrice * buyTx.quantity,
          uom: buyTx.products.unitOfMeasurements.unit,
        });
      } else {
        exist.quantity += buyTx.quantity;
        exist.buyTxTotalAmount += buyTx.unitPrice * buyTx.quantity;
      }
      return acc;
    },
    [
      {
        productId: "",
        productNumber: "",
        quantity: 0,
        buyTxTotalAmount: 0,
        uom: "",
      },
    ]
  );

  //SELL TXS
  const sellTxs = await db.query.sellTransactions.findMany({
    where:
      timeFrame === "all"
        ? eq(sellTransactions.userId, userId)
        : timeFrame === "month"
        ? sql`to_char(${sellTransactions.date},'MM') like ${month} 
              and to_char(${sellTransactions.date},'YYYY') like ${year} 
              and ${sellTransactions.userId} like ${userId}`
        : sql`to_char(${sellTransactions.date},'YYYY') like ${year} 
              and ${sellTransactions.userId} like ${userId}`,
  });

  //SELL TX STOCKS
  const sellTxStocks = sellTxs.reduce(
    (acc, sellTx) => {
      const exist = acc.find((item) => item.productId === sellTx.productId);

      if (!exist) {
        acc.push({
          productId: sellTx.productId,
          quantity: sellTx.quantity,
          sellTxTotalAmount: (sellTx.unitPrice ?? 0) * sellTx.quantity,
        });
      } else {
        exist.quantity += sellTx.quantity;
        exist.sellTxTotalAmount += (sellTx.unitPrice ?? 0) * sellTx.quantity;
      }
      return acc;
    },
    [
      {
        productId: "",
        quantity: 0,
        sellTxTotalAmount: 0,
      },
    ]
  );

  //STOCK BAL
  const stockBal = [] as StockBal[];
  buyTxStocks.map((buyTx) => {
    const exist = sellTxStocks.find(
      (item) => item.productId === buyTx.productId
    );
    const buyBal = +buyTx.quantity;
    const sellBal = exist?.quantity ? +exist.quantity : 0;
    const bal = buyBal - sellBal;
    if (bal !== 0) {
      stockBal.push({
        productNumber: buyTx.productNumber,
        productId: buyTx.productId,
        quantity: buyBal - sellBal,
        buyTxTotalQuantity: buyTx.quantity,
        buyTxTotalAmount: buyTx.buyTxTotalAmount,
        sellTxTotalQuantity: exist?.quantity ?? 0,
        sellTxTotalAmount: exist?.sellTxTotalAmount ?? 0,
        uom: buyTx.uom,
      });
    }
  });

  // console.log("stockBal", stockBal);

  return stockBal as StockBal[];
};
