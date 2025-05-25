import { pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { products } from "./products";
import { buyTransactions } from "./buyTransactions";
import { relations } from "drizzle-orm";

export const productBuyTransactions = pgTable(
  "product_buy_transactions",
  {
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    buyTransactionId: text("buy_transaction_id")
      .notNull()
      .references(() => buyTransactions.id),
  },
  (table) => [
    {
      pk: primaryKey({ columns: [table.productId, table.buyTransactionId] }),
    },
  ]
);

export const productBuyTransactionRelations = relations(
  productBuyTransactions,
  ({ one }) => ({
    products: one(products, {
      fields: [productBuyTransactions.productId],
      references: [products.id],
    }),
    buyTransactions: one(buyTransactions, {
      fields: [productBuyTransactions.buyTransactionId],
      references: [buyTransactions.id],
    }),
  })
);
