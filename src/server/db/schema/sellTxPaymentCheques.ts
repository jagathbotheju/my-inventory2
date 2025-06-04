import { InferSelectModel, relations } from "drizzle-orm";
import { doublePrecision, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { sellTxPayments } from "./sellTxPayments";

export const sellTxPaymentCheques = pgTable("sell_tx_payment_cheques", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  sellTxPaymentId: text("sell_tx_payment_id")
    .notNull()
    .references(() => sellTxPayments.id, { onDelete: "cascade" }),
  chequeNumber: text("cheque_number"),
  bankName: text("bank_name"),
  amount: doublePrecision("amount").default(0),
  chequeDate: timestamp("cheque_date", { mode: "string" }).defaultNow(),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export const sellTxPaymentChequeRelations = relations(
  sellTxPaymentCheques,
  ({ one }) => ({
    sellTxPayments: one(sellTxPayments, {
      fields: [sellTxPaymentCheques.sellTxPaymentId],
      references: [sellTxPayments.id],
    }),
  })
);

export type SellTxPaymentCheques = InferSelectModel<
  typeof sellTxPaymentCheques
>;
// export type SellTxPaymentChequesExt = InferSelectModel<
//   typeof sellTxPaymentCheques
// > & {
//   sellTxPayments: SellTxPayments;
// };
