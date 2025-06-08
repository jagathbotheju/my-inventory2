import { InferSelectModel, relations } from "drizzle-orm";
import { doublePrecision, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import {
  SellTxPaymentCheques,
  sellTxPaymentCheques,
} from "./sellTxPaymentCheques";
import { sellTxInvoices } from "./sellTxInvoices";

export const sellTxPayments = pgTable("sell_tx_payments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  invoiceId: text("invoice_id")
    .references(() => sellTxInvoices.id, { onDelete: "cascade" })
    .notNull(),
  paymentMode: text("payment_mode"),
  cacheAmount: doublePrecision("cache_amount").default(0),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export const sellTxPaymentRelations = relations(
  sellTxPayments,
  ({ one, many }) => ({
    sellTxInvoices: one(sellTxInvoices, {
      fields: [sellTxPayments.invoiceId],
      references: [sellTxInvoices.id],
    }),
    sellTxPaymentCheques: many(sellTxPaymentCheques),
  })
);

export type SellTxPayment = InferSelectModel<typeof sellTxPayments>;
export type SellTxPaymentExt = InferSelectModel<typeof sellTxPayments> & {
  sellTxPaymentCheques: SellTxPaymentCheques[];
};
