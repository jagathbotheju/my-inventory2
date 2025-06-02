import { InferSelectModel, relations } from "drizzle-orm";
import { doublePrecision, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { SellTransaction, sellTransactions } from "./sellTransactions";

export const sellTxCheques = pgTable("sell_tx_cheques", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  sellTransactionsId: text("sell_transactions_id")
    .notNull()
    .references(() => sellTransactions.id, { onDelete: "cascade" }),
  chequeNumber: text("cheque_number"),
  bankName: text("bank_name"),
  amount: doublePrecision("amount").default(0),
  chequeDate: timestamp("cheque_date", { mode: "string" }).defaultNow(),
});

export const sellTxChequeRelations = relations(sellTxCheques, ({ one }) => ({
  sellTransactions: one(sellTransactions, {
    fields: [sellTxCheques.sellTransactionsId],
    references: [sellTransactions.id],
  }),
}));

export type SellTxCheques = InferSelectModel<typeof sellTxCheques>;
export type SellTxChequesExt = InferSelectModel<typeof sellTxCheques> & {
  sellTransactions: SellTransaction;
};
