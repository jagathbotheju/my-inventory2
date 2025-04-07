import { InferSelectModel, relations } from "drizzle-orm";
import {
  doublePrecision,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { ProductExt, products } from "./products";
import { Supplier, suppliers } from "./suppliers";

export const buyTransactions = pgTable("buy_transactions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  supplierId: text("supplier_id")
    .references(() => suppliers.id)
    .notNull(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  productNumber: text("product_number"),
  invoiceNumber: text("invoice_number"),
  quantity: integer("quantity").notNull(),
  unitPrice: doublePrecision("unit_price").default(0).notNull(),
  date: timestamp("date", { mode: "string" }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export const buyTransactionRelations = relations(
  buyTransactions,
  ({ one }) => ({
    users: one(users, {
      fields: [buyTransactions.userId],
      references: [users.id],
    }),
    suppliers: one(suppliers, {
      fields: [buyTransactions.supplierId],
      references: [suppliers.id],
    }),
    products: one(products, {
      fields: [buyTransactions.productId],
      references: [products.id],
    }),
  })
);

export type BuyTransaction = InferSelectModel<typeof buyTransactions>;
export type BuyTransactionExt = InferSelectModel<typeof buyTransactions> & {
  products: ProductExt;
  suppliers: Supplier;
};
