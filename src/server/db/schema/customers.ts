import { InferSelectModel, relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { products } from "./products";

export const customers = pgTable("customers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email"),
  address: text("address"),
  landPhone: text("land_phone"),
  mobilePhone: text("mobile_phone"),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

// export const supplierRelations = relations(suppliers, ({ many }) => ({
//   products: many(products),
// }));

export type Customer = InferSelectModel<typeof customers>;
