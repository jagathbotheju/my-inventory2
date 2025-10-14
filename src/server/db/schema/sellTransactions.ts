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
import { SellTxInvoiceExt, sellTxInvoices } from "./sellTxInvoices";

export const sellTransactions = pgTable("sell_transactions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .references(() => users.id)
    .notNull(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  invoiceId: text("invoice_id")
    .references(() => sellTxInvoices.id, {
      onDelete: "cascade",
    })
    .notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: doublePrecision("unit_price").default(0).notNull(),
  purchasedPrice: doublePrecision("purchased_price").default(0).notNull(),
  customerId: text("customer_id")
    .references(() => customers.id)
    .notNull(),
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
    users: one(users, {
      fields: [sellTransactions.userId],
      references: [users.id],
    }),
    sellTxInvoices: one(sellTxInvoices, {
      fields: [sellTransactions.invoiceId],
      references: [sellTxInvoices.id],
    }),
    products: one(products, {
      fields: [sellTransactions.productId],
      references: [products.id],
    }),
  })
);

export type SellTransaction = InferSelectModel<typeof sellTransactions>;
export type SellTransactionExt = InferSelectModel<typeof sellTransactions> & {
  customers: Customer;
  products: ProductExt;
  sellTxInvoices: SellTxInvoiceExt;
};
