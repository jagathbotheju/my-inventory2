import { pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { products } from "./products";
import { relations } from "drizzle-orm";
import { sellTransactions } from "./sellTransactions";

export const productSellTransactions = pgTable(
  "product_sell_transactions",
  {
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sellTransactionId: text("sell_transaction_id")
      .notNull()
      .references(() => sellTransactions.id),
  },
  (table) => [
    {
      pk: primaryKey({ columns: [table.productId, table.sellTransactionId] }),
    },
  ]
);

export const productSellTransactionRelations = relations(
  productSellTransactions,
  ({ one }) => ({
    products: one(products, {
      fields: [productSellTransactions.productId],
      references: [products.id],
    }),
    sellTransactions: one(sellTransactions, {
      fields: [productSellTransactions.sellTransactionId],
      references: [sellTransactions.id],
    }),
  })
);
