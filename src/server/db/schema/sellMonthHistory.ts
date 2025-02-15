import {
  doublePrecision,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { InferSelectModel } from "drizzle-orm";

export const sellMonthHistory = pgTable(
  "sell_monthly_history",
  {
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    totalPrice: doublePrecision("total_price"),
    day: integer("day"),
    month: integer("month"),
    year: integer("year"),
    createdAt: timestamp("created_at", { mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    {
      pk: primaryKey({
        columns: [table.userId, table.day, table.month, table.year],
      }),
    },
  ]
);

export type SellMonthHistory = InferSelectModel<typeof sellMonthHistory>;
