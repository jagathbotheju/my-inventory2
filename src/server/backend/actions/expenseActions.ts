"use server";
import { ExpenseSchema } from "@/lib/schema";
import { db } from "@/server/db";
import { expenses } from "@/server/db/schema";
import { Expense } from "@/server/db/schema/expenses";
import { and, eq, sql, sum } from "drizzle-orm";
import { z } from "zod";

//--total expenses
export const totalExpenses = async ({
  userId,
  period,
  timeFrame,
}: {
  userId: string;
  period: Period;
  timeFrame: TimeFrame;
}) => {
  const year = period.year;
  const month =
    period.month.toString().length > 1 ? period.month : `0${period.month}`;

  const totalExpenses = await db
    .select({
      total: sum(expenses.amount),
    })
    .from(expenses)
    // .where(eq(expenses.userId, userId));
    .where(
      timeFrame === "month"
        ? sql`to_char(${expenses.date},'MM') like ${month} and to_char(${expenses.date},'YYYY') like ${year} and ${expenses.userId} like ${userId}`
        : sql`to_char(${expenses.date},'YYYY') like ${year} and ${expenses.userId} like ${userId}`
    );

  return totalExpenses[0].total;
};

//--delete expense
export const deleteExpense = async ({
  userId,
  expenseId,
}: {
  userId: string;
  expenseId: string;
}) => {
  try {
    const deletedExpense = await db
      .delete(expenses)
      .where(and(eq(expenses.userId, userId), eq(expenses.id, expenseId)))
      .returning();

    if (deletedExpense.length) {
      return { success: "Expense deleted successfully" };
    }

    return { error: "Could not delete Expense" };
  } catch (error) {
    console.log("error", error);
    return { error: "Could not delete Expense" };
  }
};

//--add expense
export const addExpense = async ({
  formData,
  userId,
}: {
  formData: z.infer<typeof ExpenseSchema>;
  userId: string;
}) => {
  try {
    const newExpense = await db
      .insert(expenses)
      .values({
        userId,
        title: formData.title,
        description: formData.description,
        date: formData.date.toDateString(),
        amount: formData.amount,
      })
      .returning();

    if (newExpense.length) return { success: "New Expense added successfully" };
    return { error: "Count not add Expense" };
  } catch (error) {
    console.log(error);
    return { error: "Count not add Expense" };
  }
};

//--get user expenses
export const getExpenses = async ({
  userId,
  period,
  timeFrame,
}: {
  userId: string;
  period: Period;
  timeFrame: TimeFrame;
}) => {
  const year = period.year;
  const month =
    period.month.toString().length > 1 ? period.month : `0${period.month}`;

  const allExpenses = await db.query.expenses.findMany({
    where:
      timeFrame === "month"
        ? sql`to_char(${expenses.date},'MM') like ${month} and to_char(${expenses.date},'YYYY') like ${year} and ${expenses.userId} like ${userId}`
        : sql`to_char(${expenses.date},'YYYY') like ${year} and ${expenses.userId} like ${userId}`,
  });

  return allExpenses as Expense[];
};
