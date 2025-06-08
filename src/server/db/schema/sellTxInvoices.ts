import { InferSelectModel, relations } from "drizzle-orm";
import { doublePrecision, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { SellTransactionExt, sellTransactions } from "./sellTransactions";
import { SellTxPaymentExt, sellTxPayments } from "./sellTxPayments";

export const sellTxInvoices = pgTable("sell_tx_invoices", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  invoiceNumber: text("invoice_number").notNull(),
  totalCash: doublePrecision("total_cash").default(0),
  date: timestamp("date", { mode: "string" }).defaultNow(),
});

export const sellTxInvoiceRelations = relations(sellTxInvoices, ({ many }) => ({
  sellTxPayments: many(sellTxPayments),
  sellTransactions: many(sellTransactions),
}));

export type SellTxInvoice = InferSelectModel<typeof sellTxInvoices>;
export type SellTxInvoiceExt = InferSelectModel<typeof sellTxInvoices> & {
  sellTxPayments: SellTxPaymentExt[];
  sellTransactions: SellTransactionExt[];
};
