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
import { buyTxInvoices } from "./buyTxInvoices";

export const buyTransactions = pgTable("buy_transactions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id") //ok
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  supplierId: text("supplier_id") //ok
    .references(() => suppliers.id)
    .notNull(),
  productId: text("product_id") //ok
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  productNumber: text("product_number"), //ok
  invoiceNumber: text("invoice_number"), //ok
  invoiceId: text("invoice_id") //backend
    .references(() => buyTxInvoices.id, {
      onDelete: "cascade",
    })
    .notNull(),
  quantity: integer("quantity").notNull(), //ok
  unitPrice: doublePrecision("unit_price").default(0).notNull(), //ok
  date: timestamp("date", { mode: "string" }).notNull().defaultNow(), //ok
  paymentMode: text("payment_mode"), //ok
  cacheAmount: doublePrecision("cache_amount").default(0), //ok
  creditAmount: doublePrecision("credit_amount").default(0), //ok
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
    buyTxInvoices: one(buyTxInvoices, {
      fields: [buyTransactions.invoiceId],
      references: [buyTxInvoices.id],
    }),
  })
);

export type BuyTransaction = InferSelectModel<typeof buyTransactions>;
export type BuyTransactionExt = InferSelectModel<typeof buyTransactions> & {
  products: ProductExt;
  suppliers: Supplier;
};
