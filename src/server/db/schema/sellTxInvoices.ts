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
  totalAmount: doublePrecision("total_amount").default(0),
  date: timestamp("date", { mode: "string" }).defaultNow(),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export const sellTxInvoiceRelations = relations(
  sellTxInvoices,
  ({ one, many }) => ({
    sellTransactions: many(sellTransactions),
    sellTxPayments: one(sellTxPayments),
  })
);

export type SellTxInvoice = InferSelectModel<typeof sellTxInvoices>;
export type SellTxInvoiceExt = InferSelectModel<typeof sellTxInvoices> & {
  sellTransactions: SellTransactionExt[];
  sellTxPayments: SellTxPaymentExt;
};
