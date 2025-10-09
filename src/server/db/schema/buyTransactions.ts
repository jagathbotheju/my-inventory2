import { InferSelectModel, relations } from "drizzle-orm";
import {
  doublePrecision,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { ProductExt, products } from "./products";
import { BuyTxInvoice, buyTxInvoices } from "./buyTxInvoices";
import { users } from "./users";

export const buyTransactions = pgTable("buy_transactions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id") //ok
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  invoiceId: text("invoice_id")
    .references(() => buyTxInvoices.id, {
      onDelete: "cascade",
    })
    .notNull(),
  quantity: integer("quantity").notNull(), //ok
  unitPrice: doublePrecision("unit_price").default(0).notNull(), //ok
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
    products: one(products, {
      fields: [buyTransactions.productId],
      references: [products.id],
    }),
    buyTxInvoices: one(buyTxInvoices, {
      fields: [buyTransactions.invoiceId],
      references: [buyTxInvoices.id],
    }),
  })
);

export type BuyTransaction = InferSelectModel<typeof buyTransactions>;
export type BuyTransactionExt = InferSelectModel<typeof buyTransactions> & {
  products: ProductExt;
  byTxInvoices: BuyTxInvoice;
};
