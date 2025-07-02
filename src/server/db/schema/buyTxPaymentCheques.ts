import { InferSelectModel, relations } from "drizzle-orm";
import { doublePrecision, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { buyTxPayments } from "./buyTxPayments";

export const buyTxPaymentCheques = pgTable("buy_tx_payment_cheques", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  buyTxPaymentId: text("buy_tx_payment_id")
    .notNull()
    .references(() => buyTxPayments.id, { onDelete: "cascade" }),
  chequeNumber: text("cheque_number"),
  bankName: text("bank_name"),
  amount: doublePrecision("amount").default(0),
  chequeDate: timestamp("cheque_date", { mode: "string" }).defaultNow(),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export const buyTxPaymentChequeRelations = relations(
  buyTxPaymentCheques,
  ({ one }) => ({
    buyTxPayments: one(buyTxPayments, {
      fields: [buyTxPaymentCheques.buyTxPaymentId],
      references: [buyTxPayments.id],
    }),
  })
);

export type BuyTxPaymentCheques = InferSelectModel<typeof buyTxPaymentCheques>;
