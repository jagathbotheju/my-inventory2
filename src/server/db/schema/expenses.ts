import { doublePrecision, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { User, users } from "./users";
import { InferSelectModel, relations } from "drizzle-orm";

export const expenses = pgTable("expenses", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  amount: doublePrecision("amount").default(0),
  date: timestamp("date", { mode: "string" }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export const expenseRelations = relations(expenses, ({ one }) => ({
  users: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
}));

export type Expense = InferSelectModel<typeof expenses>;
export type ExpenseExt = InferSelectModel<typeof expenses> & {
  users: User;
};
