"use server";
import { db } from "@/server/db";
import { Supplier } from "@/server/db/schema/suppliers";
import { NewSupplierSchema } from "@/lib/schema";
import { suppliers } from "@/server/db/schema";
import { z } from "zod";
import { and, eq } from "drizzle-orm";

export const getSuppliers = async (userId: string) => {
  const allSuppliers = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.userId, userId));
  return allSuppliers as Supplier[];
};

export const getSupplierById = async ({
  supplierId,
  userId,
}: {
  supplierId: string;
  userId: string;
}) => {
  const supplier = await db
    .select()
    .from(suppliers)
    .where(and(eq(suppliers.id, supplierId), eq(suppliers.userId, userId)));
  return supplier as Supplier[];
};

export const addSupplier = async ({
  formData,
  supplierId,
  userId,
}: {
  formData: z.infer<typeof NewSupplierSchema>;
  supplierId: string | undefined;
  userId: string;
}) => {
  try {
    if (supplierId) {
      const updatedSupplier = await db
        .update(suppliers)
        .set(formData)
        .where(and(eq(suppliers.id, supplierId), eq(suppliers.userId, userId)))
        .returning();
      if (updatedSupplier.length) {
        return { success: "Supplier updated successfully" };
      }
      return { error: "Could not update Supplier" };
    } else {
      const newSupplier = await db
        .insert(suppliers)
        .values({ ...formData, userId })
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

export const deleteSupplier = async ({
  supplierId,
  userId,
}: {
  supplierId: string;
  userId: string;
}) => {
  try {
    const deletedSupplier = await db
      .delete(suppliers)
      .where(and(eq(suppliers.id, supplierId), eq(suppliers.userId, userId)))
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
