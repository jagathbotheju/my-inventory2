import { InferSelectModel } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const unitOfMeasurements = pgTable("unit_of_measurements", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  unit: text("unit").notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export type UnitOfMeasurement = InferSelectModel<typeof unitOfMeasurements>;
