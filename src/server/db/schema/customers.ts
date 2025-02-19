import { InferSelectModel } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const customers = pgTable("customers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  address: text("address"),
  landPhone: text("land_phone"),
  mobilePhone: text("mobile_phone"),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export type Customer = InferSelectModel<typeof customers>;
