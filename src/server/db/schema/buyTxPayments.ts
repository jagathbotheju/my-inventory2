import { InferSelectModel, relations } from "drizzle-orm";
import { doublePrecision, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { buyTxInvoices } from "./buyTxInvoices";
import {
  BuyTxPaymentCheques,
  buyTxPaymentCheques,
} from "./buyTxPaymentCheques";

export const buyTxPayments = pgTable("buy_tx_payments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  invoiceId: text("invoice_id")
    .references(() => buyTxInvoices.id, { onDelete: "cascade" })
    .notNull(),
  paymentMode: text("payment_mode"),
  cacheAmount: doublePrecision("cache_amount").default(0),
  creditAmount: doublePrecision("credit_amount").default(0),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export const buyTxPaymentRelations = relations(
  buyTxPayments,
  ({ one, many }) => ({
    buuTxInvoices: one(buyTxInvoices, {
      fields: [buyTxPayments.invoiceId],
      references: [buyTxInvoices.id],
    }),
    buyTxPaymentCheques: many(buyTxPaymentCheques),
  })
);

export type BuyTxPayment = InferSelectModel<typeof buyTxPayments>;
export type BuyTxPaymentExt = InferSelectModel<typeof buyTxPayments> & {
  buyTxPaymentCheques: BuyTxPaymentCheques[];
};
