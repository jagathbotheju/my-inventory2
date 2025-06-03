import { InferSelectModel, relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { Product, products } from "./products";
import { users } from "./users";
import { Customer, customers } from "./customers";

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
  customers: many(customers),
}));

export type Supplier = InferSelectModel<typeof suppliers>;
export type SupplierExt = InferSelectModel<typeof products> & {
  products: Product[];
  customers: Customer[];
};
