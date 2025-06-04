import { InferSelectModel, relations } from "drizzle-orm";
import { doublePrecision, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { SellTransaction, sellTransactions } from "./sellTransactions";
import {
  SellTxPaymentCheques,
  sellTxPaymentCheques,
} from "./sellTxPaymentCheques";

export const sellTxPayments = pgTable("sell_tx_payments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  sellTransactionsId: text("sell_transactions_id")
    .notNull()
    .references(() => sellTransactions.id, { onDelete: "cascade" }),
  paymentMode: text("payment_mode"),
  cacheAmount: doublePrecision("cache_amount").default(0),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export const sellTxPaymentRelations = relations(
  sellTxPayments,
  ({ one, many }) => ({
    sellTransactions: one(sellTransactions, {
      fields: [sellTxPayments.sellTransactionsId],
      references: [sellTransactions.id],
    }),
    sellTxPaymentCheques: many(sellTxPaymentCheques),
  })
);

export type SellTxPayments = InferSelectModel<typeof sellTxPayments>;
export type SellTxPaymentsExt = InferSelectModel<typeof sellTxPayments> & {
  sellTransactions: SellTransaction;
  sellTxPaymentCheques: SellTxPaymentCheques[];
};
