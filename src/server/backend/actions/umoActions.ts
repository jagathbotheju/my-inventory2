"use server";
import { NewUomSchema } from "@/lib/schema";
import { db } from "@/server/db";
import {
  UnitOfMeasurement,
  unitOfMeasurements,
} from "@/server/db/schema/unitOfMeasurements";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const getUoms = async () => {
  const uoms = await db.query.unitOfMeasurements.findMany();
  return uoms as UnitOfMeasurement[];
};

export const getUomById = async (id: string) => {
  const uom = await db
    .select()
    .from(unitOfMeasurements)
    .where(eq(unitOfMeasurements.id, id));
  return uom as UnitOfMeasurement[];
};

export const addUom = async (formData: z.infer<typeof NewUomSchema>) => {
  try {
    const newUom = await db
      .insert(unitOfMeasurements)
      .values(formData)
      .returning();
    if (newUom.length) {
      return { success: "UOM added successfully" };
    }
    return { error: "Could not add UOM" };
  } catch (error) {
    console.log(error);
    return { error: "Could not add UOM" };
  }
};

export const deleteUom = async (id: string) => {
  try {
    const deletedUom = await db
      .delete(unitOfMeasurements)
      .where(eq(unitOfMeasurements.id, id))
      .returning();
    if (deletedUom.length) {
      return { success: "UMO deleted successfully" };
    }
    return { error: "Could not delete UMO" };
  } catch (error) {
    console.log(error);
    return { error: "Could not delete UMO" };
  }
};
