import {
  doublePrecision,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { InferSelectModel, relations } from "drizzle-orm";
import { ProductExt, products } from "./products";
import { Supplier, suppliers } from "./suppliers";
import { UnitOfMeasurement } from "./unitOfMeasurements";

export const stocks = pgTable(
  "stocks",
  {
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    productId: text("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    productNumber: text("product_number"),
    supplierId: text("supplier_id")
      .references(() => suppliers.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .notNull()
      .defaultNow(),
    quantity: integer("quantity").notNull(),
    unitPrice: doublePrecision("unit_price").notNull(),
  },
  (table) => [
    {
      pk: primaryKey({
        columns: [
          table.userId,
          table.productId,
          table.supplierId,
          table.unitPrice,
        ],
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
  suppliers: Supplier;
  unitOfMeasurements: UnitOfMeasurement;
};
