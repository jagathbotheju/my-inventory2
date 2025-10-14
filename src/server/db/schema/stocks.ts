import {
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { InferSelectModel, relations } from "drizzle-orm";
import { ProductExt, products } from "./products";
import { suppliers } from "./suppliers";

export const stocks = pgTable(
  "stocks",
  {
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    productId: text("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    supplierId: text("supplier_id")
      .references(() => suppliers.id, { onDelete: "cascade" })
      .notNull(),
    quantity: integer("quantity").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    {
      pk: primaryKey({
        columns: [table.userId, table.productId],
      }),
    },
  ]
);

export const stocksRelations = relations(stocks, ({ one }) => ({
  products: one(products, {
    fields: [stocks.productId],
    references: [products.id],
  }),
}));

export type Stock = InferSelectModel<typeof stocks>;
export type StockExt = InferSelectModel<typeof stocks> & {
  products: ProductExt;
};
