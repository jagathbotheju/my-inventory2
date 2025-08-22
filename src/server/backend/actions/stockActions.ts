"use server";
import { TableDataProductsPicker } from "@/components/ProductsPickerDialog";
import { db } from "@/server/db";
import {
  buyTransactions,
  products,
  sellTransactions,
  stocks,
} from "@/server/db/schema";
import { Stock, StockExt } from "@/server/db/schema/stocks";
import { and, asc, eq, ne, sql, sum } from "drizzle-orm";

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

//ALL STOCKS BY SUPPLIER
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

//ALL STOCKS BY SUPPLIER TEST
export const getStocksBySupplierTest = async ({
  userId,
  supplierId,
  sellMode,
}: {
  userId: string;
  supplierId: string;
  sellMode?: boolean;
}) => {
  //products
  const supplierProducts = await db
    .select()
    .from(products)
    .where(
      and(eq(products.userId, userId), eq(products.supplierId, supplierId))
    );

  if (!supplierProducts.length) {
    return { error: "Products no found, please add a Product" };
  }

  // SELL TXS
  let sellTxsTest = [] as {
    quantity: string | null;
    productNumber: string | null;
    productId: string;
    unitPrice?: number | null;
  }[];

  if (sellMode) {
    sellTxsTest = await db
      .select({
        quantity: sum(sellTransactions.quantity),
        productNumber: sellTransactions.productNumber,
        productId: sellTransactions.productId,
        purchasedPrice: sellTransactions.purchasedPrice,
      })
      .from(sellTransactions)
      .where(
        and(
          eq(sellTransactions.userId, userId),
          eq(sellTransactions.supplierId, supplierId)
          // ilike(sellTransactions.productNumber, "%abc-001%")
        )
      )
      .groupBy(
        sellTransactions.purchasedPrice,
        sellTransactions.productId,
        sellTransactions.productNumber
      );
  } else {
    sellTxsTest = await db
      .select({
        quantity: sum(sellTransactions.quantity),
        productNumber: sellTransactions.productNumber,
        productId: sellTransactions.productId,
      })
      .from(sellTransactions)
      .where(
        and(
          eq(sellTransactions.userId, userId),
          eq(sellTransactions.supplierId, supplierId)
          // ilike(sellTransactions.productNumber, "%abc-001%")
        )
      )
      .groupBy(sellTransactions.productId, sellTransactions.productNumber);
  }

  // BUY TXS
  let buyTxsTest = [] as {
    quantity: string | null;
    productNumber: string | null;
    productId: string;
    unitPrice?: number | null;
  }[];

  if (sellMode) {
    buyTxsTest = await db
      .select({
        quantity: sum(buyTransactions.quantity),
        productNumber: buyTransactions.productNumber,
        productId: buyTransactions.productId,
        unitPrice: buyTransactions.unitPrice,
      })
      .from(buyTransactions)
      .where(
        and(
          eq(buyTransactions.userId, userId),
          eq(buyTransactions.supplierId, supplierId)
        )
      )
      .groupBy(
        buyTransactions.unitPrice,
        buyTransactions.productNumber,
        buyTransactions.productId
      );
  } else {
    buyTxsTest = await db
      .select({
        quantity: sum(buyTransactions.quantity),
        productNumber: buyTransactions.productNumber,
        productId: buyTransactions.productId,
      })
      .from(buyTransactions)
      .where(
        and(
          eq(buyTransactions.userId, userId),
          eq(buyTransactions.supplierId, supplierId)
        )
      )
      .groupBy(buyTransactions.productId, buyTransactions.productNumber);
  }

  //STOCK BAL
  const stockBal = [] as TableDataProductsPicker[];
  buyTxsTest.map((buyTx) => {
    const exist = sellMode
      ? sellTxsTest.find(
          (item) =>
            item.productId === buyTx.productId &&
            item.unitPrice === buyTx.unitPrice
        )
      : sellTxsTest.find((item) => item.productId === buyTx.productId);
    const buyBal = buyTx && buyTx.quantity ? +buyTx?.quantity : 0;
    const sellBal = exist?.quantity ? +exist.quantity : 0;
    const bal = buyBal - sellBal;
    if (sellMode) {
      if (bal > 0) {
        stockBal.push({
          quantity: bal,
          productNumber: buyTx.productNumber as string,
          productId: buyTx.productId,
          purchasedPrice: buyTx?.unitPrice ?? 0,
          sellMode,
        });
      }
    } else {
      stockBal.push({
        quantity: bal,
        productNumber: buyTx.productNumber as string,
        productId: buyTx.productId,
      });
    }
  });

  const filteredProducts = supplierProducts.map((product) => {
    const existsInStockBal = stockBal.find(
      (stock) => stock.productId === product.id
    );
    if (existsInStockBal) {
      return existsInStockBal;
    } else {
      return {
        productId: product.id,
        productNumber: product.productNumber,
        quantity: 0,
      };
    }
  });

  return filteredProducts as StockBal[];
};

export const getAllStocks = async (userId: string) => {
  const stock = await db.query.stocks.findMany({
    where: and(eq(stocks.userId, userId), ne(stocks.quantity, 0)),
    orderBy: asc(stocks.productNumber),
  });
  return stock as Stock[];
};

//====ALL USER STOCKS
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
          sellTxActTotalAmount: (sellTx.purchasedPrice ?? 0) * sellTx.quantity,
        });
      } else {
        exist.quantity += sellTx.quantity;
        exist.sellTxTotalAmount += (sellTx.unitPrice ?? 0) * sellTx.quantity;
        exist.sellTxActTotalAmount +=
          (sellTx.purchasedPrice ?? 0) * sellTx.quantity;
      }
      return acc;
    },
    [
      {
        productId: "",
        quantity: 0,
        sellTxTotalAmount: 0,
        sellTxActTotalAmount: 0,
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
        sellTxActTotalAmount: exist?.sellTxActTotalAmount ?? 0,
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
          sellTxActTotalAmount: (sellTx.purchasedPrice ?? 0) * sellTx.quantity,
        });
      } else {
        exist.quantity += sellTx.quantity;
        exist.sellTxTotalAmount += (sellTx.unitPrice ?? 0) * sellTx.quantity;
        exist.sellTxActTotalAmount +=
          (sellTx.purchasedPrice ?? 0) * sellTx.quantity;
      }
      return acc;
    },
    [
      {
        productId: "",
        quantity: 0,
        sellTxTotalAmount: 0,
        sellTxActTotalAmount: 0,
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
        sellTxActTotalAmount: exist?.sellTxActTotalAmount ?? 0,
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
          sellTxActTotalAmount: (sellTx.purchasedPrice ?? 0) * sellTx.quantity,
        });
      } else {
        exist.quantity += sellTx.quantity;
        exist.sellTxTotalAmount += (sellTx.unitPrice ?? 0) * sellTx.quantity;
        exist.sellTxActTotalAmount +=
          (sellTx.purchasedPrice ?? 0) * sellTx.quantity;
      }
      return acc;
    },
    [
      {
        productId: "",
        quantity: 0,
        sellTxTotalAmount: 0,
        sellTxActTotalAmount: 0,
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
        sellTxActTotalAmount: exist?.sellTxActTotalAmount ?? 0,
        uom: buyTx.uom,
      });
    }
  });

  return stockBal as StockBal[];
};
