import { InferSelectModel, relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { Supplier, suppliers } from "./suppliers";

export const customers = pgTable("customers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  supplierId: text("supplier_id").references(() => suppliers.id),
  name: text("name").notNull(),
  email: text("email"),
  address: text("address"),
  landPhone: text("land_phone"),
  mobilePhone: text("mobile_phone"),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export const customerRelations = relations(customers, ({ one }) => ({
  suppliers: one(suppliers, {
    fields: [customers.supplierId],
    references: [suppliers.id],
  }),
}));

export type Customer = InferSelectModel<typeof customers>;
export type CustomerExt = InferSelectModel<typeof customers> & {
  suppliers: Supplier;
};
