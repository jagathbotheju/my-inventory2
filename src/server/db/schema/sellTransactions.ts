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
import { Customer, customers } from "./customers";

export const sellTransactions = pgTable("sell_transactions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .references(() => users.id)
    .notNull(),
  customerId: text("customer_id")
    .references(() => customers.id)
    .notNull(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: doublePrecision("unit_price").default(0),
  date: timestamp("date", { mode: "string" }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export const sellTransactionRelations = relations(
  sellTransactions,
  ({ one }) => ({
    customers: one(customers, {
      fields: [sellTransactions.customerId],
      references: [customers.id],
    }),
    products: one(products, {
      fields: [sellTransactions.productId],
      references: [products.id],
    }),
  })
);

export type SellTransaction = InferSelectModel<typeof sellTransactions>;
export type SellTransactionExit = InferSelectModel<typeof sellTransactions> & {
  customers: Customer;
  products: ProductExt;
};
