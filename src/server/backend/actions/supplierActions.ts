"use server";
import { db } from "@/server/db";
import { Supplier } from "@/server/db/schema/suppliers";
import { NewSupplierSchema } from "@/lib/schema";
import { suppliers } from "@/server/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const getSuppliers = async () => {
  const suppliers = await db.query.suppliers.findMany();
  return suppliers as Supplier[];
};

export const getSupplierById = async (id: string) => {
  const supplier = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.id, id));
  return supplier as Supplier[];
};

export const addSupplier = async ({
  formData,
  supplierId,
}: {
  formData: z.infer<typeof NewSupplierSchema>;
  supplierId: string | undefined;
}) => {
  try {
    if (supplierId) {
      const updatedSupplier = await db
        .update(suppliers)
        .set(formData)
        .where(eq(suppliers.id, supplierId))
        .returning();
      if (updatedSupplier.length) {
        return { success: "Supplier updated successfully" };
      }
      return { error: "Could not update Supplier" };
    } else {
      const newSupplier = await db
        .insert(suppliers)
        .values(formData)
        .returning();
      if (newSupplier.length) {
        return { success: "Supplier registered successfully" };
      }
      return { error: "Could not update Supplier" };
    }
  } catch (error) {
    console.log(error);
    return { error: "Could not update Supplier" };
  }
};

export const deleteSupplier = async (id: string) => {
  try {
    const deletedSupplier = await db
      .delete(suppliers)
      .where(eq(suppliers.id, id))
      .returning();
    if (deletedSupplier.length) {
      return { success: "Supplier deleted successfully" };
    }
    return { error: "Could not delete Supplier" };
  } catch (error) {
    console.log(error);
    return { error: "Could not delete Supplier" };
  }
};
