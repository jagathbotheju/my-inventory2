import { InferSelectModel, relations } from "drizzle-orm";
import { doublePrecision, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { BuyTransactionExt, buyTransactions } from "./buyTransactions";
import { BuyTxPaymentExt, buyTxPayments } from "./buyTxPayments";

export const buyTxInvoices = pgTable("buy_tx_invoices", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  invoiceNumber: text("invoice_number").notNull(),
  totalAmount: doublePrecision("total_amount").default(0),
  date: timestamp("date", { mode: "string" }).defaultNow(),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export const buyTxInvoiceRelations = relations(
  buyTxInvoices,
  ({ many, one }) => ({
    buyTransactions: many(buyTransactions),
    buyTxPayments: one(buyTxPayments),
  })
);

export type BuyTxInvoice = InferSelectModel<typeof buyTxInvoices>;
export type BuyTxInvoiceExt = InferSelectModel<typeof buyTxInvoices> & {
  buyTransactions: BuyTransactionExt[];
  buyTxPayments: BuyTxPaymentExt;
};
