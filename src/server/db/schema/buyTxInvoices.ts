import { InferSelectModel, relations } from "drizzle-orm";
import { doublePrecision, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { BuyTxPaymentExt, buyTxPayments } from "./buyTxPayments";
import { BuyTransactionExt, buyTransactions } from "./buyTransactions";

export const buyTxInvoices = pgTable("buy_tx_invoices", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  invoiceNumber: text("invoice_number").notNull(),
  totalCash: doublePrecision("total_cash").default(0),
  date: timestamp("date", { mode: "string" }).defaultNow(),
});

export const buyTxInvoiceRelations = relations(buyTxInvoices, ({ many }) => ({
  buyTxPayments: many(buyTxPayments),
  buyTransactions: many(buyTransactions),
}));

export type BuyTxInvoice = InferSelectModel<typeof buyTxInvoices>;
export type BuyTxInvoiceExt = InferSelectModel<typeof buyTxInvoices> & {
  buyTxPayments: BuyTxPaymentExt[];
  buyTransactions: BuyTransactionExt[];
};
