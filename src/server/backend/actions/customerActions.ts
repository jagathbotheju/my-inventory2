"use server";
import { db } from "@/server/db";
import { NewCustomerSchema } from "@/lib/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { Customer, customers } from "@/server/db/schema/customers";

export const getCustomers = async (userId: string) => {
  const allCustomers = await db
    .select()
    .from(customers)
    .where(eq(customers.userId, userId));
  return allCustomers as Customer[];
};

export const getCustomerById = async (id: string) => {
  const customer = await db
    .select()
    .from(customers)
    .where(eq(customers.id, id));
  return customer as Customer[];
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
        .set({ ...formData, userId })
        .where(eq(customers.id, customerId))
        .returning();
      if (updatedCustomer.length) {
        return { success: "Customer updated successfully" };
      }
      return { error: "Could not update Customer" };
    } else {
      const newCustomer = await db
        .insert(customers)
        .values({ ...formData, userId })
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
