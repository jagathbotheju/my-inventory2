"use server";
import { db } from "@/server/db";
import { NewCustomerSchema } from "@/lib/schema";
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { Customer, CustomerExt, customers } from "@/server/db/schema/customers";

export const getCustomers = async (userId: string) => {
  const allCustomers = await db.query.customers.findMany({
    where: eq(customers.userId, userId),
    with: {
      suppliers: true,
    },
    orderBy: desc(customers.createdAt),
  });

  return allCustomers as CustomerExt[];
};

export const getCustomersBySupplier = async ({
  userId,
  supplierId,
}: {
  userId: string;
  supplierId: string;
}) => {
  const allCustomers = await db.query.customers.findMany({
    where: and(
      eq(customers.userId, userId),
      eq(customers.supplierId, supplierId)
    ),
  });

  return allCustomers as Customer[];
};

export const getCustomerById = async (id: string) => {
  const customer = await db.query.customers.findFirst({
    where: eq(customers.id, id),
    with: {
      suppliers: true,
    },
  });
  if (customer) return customer as CustomerExt;
  return {} as CustomerExt;
};

export const addCustomer = async ({
  formData,
  customerId,
  userId,
}: {
  formData: z.infer<typeof NewCustomerSchema>;
  customerId: string | undefined;
  userId: string;
}) => {
  try {
    if (customerId) {
      const updatedCustomer = await db
        .update(customers)
        .set({
          supplierId: formData.supplier,
          ...formData,
          userId,
        })
        .where(eq(customers.id, customerId))
        .returning();
      if (updatedCustomer.length) {
        return { success: "Customer updated successfully" };
      }
      return { error: "Could not update Customer" };
    } else {
      const newCustomer = await db
        .insert(customers)
        .values({
          userId,
          supplierId: formData.supplier,
          ...formData,
        })
        .returning();
      if (newCustomer.length) {
        return { success: "Customer registered successfully" };
      }
      return { error: "Could not register Customer" };
    }
  } catch (error) {
    console.log(error);
    return { error: "Could not update/register Customer" };
  }
};

export const deleteCustomer = async (id: string) => {
  try {
    const deletedCustomer = await db
      .delete(customers)
      .where(eq(customers.id, id))
      .returning();
    if (deletedCustomer.length) {
      return { success: "Customer deleted successfully" };
    }
    return { error: "Could not delete Customer" };
  } catch (error) {
    console.log(error);
    return { error: "Could not delete Customer" };
  }
};
