import { InferSelectModel, relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { products } from "./products";
import { users } from "./users";

export const suppliers = pgTable("suppliers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  address: text("address"),
  landPhone: text("land_phone"),
  mobilePhone: text("mobile_phone"),
  salesPerson: text("sales_person"),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export const supplierRelations = relations(suppliers, ({ many }) => ({
  products: many(products),
}));

export type Supplier = InferSelectModel<typeof suppliers>;
