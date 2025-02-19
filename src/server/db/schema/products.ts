import { InferSelectModel, relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { Supplier, suppliers } from "./suppliers";
import { UnitOfMeasurement, unitOfMeasurements } from "./unitOfMeasurements";
import { productBuyTransactions } from "./productBuyTransactions";
import { users } from "./users";

export const products = pgTable("products", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  productNumber: text("product_number").notNull().unique(),
  description: text("description"),
  supplierId: text("supplier_id")
    .references(() => suppliers.id, { onDelete: "cascade" })
    .notNull(),
  unitId: text("unit_id")
    .references(() => unitOfMeasurements.id)
    .notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export const productRelations = relations(products, ({ one, many }) => ({
  suppliers: one(suppliers, {
    fields: [products.supplierId],
    references: [suppliers.id],
  }),
  unitOfMeasurements: one(unitOfMeasurements, {
    fields: [products.unitId],
    references: [unitOfMeasurements.id],
  }),
  productBuyTransactions: many(productBuyTransactions),
}));

export type Product = InferSelectModel<typeof products>;
export type ProductExt = InferSelectModel<typeof products> & {
  suppliers: Supplier;
  unitOfMeasurements: UnitOfMeasurement;
};
