import {
  doublePrecision,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { InferSelectModel } from "drizzle-orm";
import { products } from "./products";
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

export type Stock = InferSelectModel<typeof stocks>;
