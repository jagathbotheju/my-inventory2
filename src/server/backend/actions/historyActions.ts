"use server";
import { db } from "@/server/db";
import { buyMonthHistory } from "@/server/db/schema/buyMonthHistory";
import { and, asc, eq } from "drizzle-orm";
import _ from "lodash";
import { getDaysInMonth } from "date-fns";
import { sellMonthHistory } from "@/server/db/schema/sellMonthHistory";
import { buyYearHistory } from "@/server/db/schema/buyYearHistory";
import { sellYearHistory } from "@/server/db/schema/sellYearHistory";

export const getBuyMonthHistoryData = async ({
  userId,
  year,
  month,
}: {
  userId: string;
  year: number;
  month: number;
}) => {
  const result = await db
    .select()
    .from(buyMonthHistory)
    .orderBy(asc(buyMonthHistory.day))
    .where(
      and(eq(buyMonthHistory.userId, userId), eq(buyMonthHistory.month, month))
    );

  if (!_.isEmpty(result)) {
    const history: HistoryData[] = [];
    const daysInMonth = getDaysInMonth(new Date(year, month - 1));

    for (let i = 1; i <= daysInMonth; i++) {
      let totalPrice = 0;
      const day = result.find((item) => item.day === i);
      if (day) {
        totalPrice = day.totalPrice || 0;
      }

      history.push({
        totalPrice,
        year,
        month,
        day: i,
      });
    }

    return history;
  }
  return [];
};

export const getSellMonthHistoryData = async ({
  userId,
  year,
  month,
}: {
  userId: string;
  year: number;
  month: number;
}) => {
  const result = await db
    .select()
    .from(sellMonthHistory)
    .orderBy(asc(sellMonthHistory.day))
    .where(
      and(
        eq(sellMonthHistory.userId, userId),
        eq(sellMonthHistory.month, month)
      )
    );

  if (!_.isEmpty(result)) {
    const history: HistoryData[] = [];
    const daysInMonth = getDaysInMonth(new Date(year, month - 1));

    for (let i = 1; i <= daysInMonth; i++) {
      let totalPrice = 0;
      const day = result.find((item) => item.day === i);
      if (day) {
        totalPrice = day.totalPrice || 0;
      }

      history.push({
        totalPrice,
        year,
        month,
        day: i,
      });
    }

    // const marksTest = history.find((item) => item.day === 29) as HistoryData;
    return history;
  }

  return [];
};

export const getBuyYearHistoryData = async ({
  userId,
  year,
}: {
  userId: string;
  year: number;
}) => {
  const result = await db
    .select()
    .from(buyYearHistory)
    .orderBy(asc(buyYearHistory.month))
    .where(
      and(eq(buyYearHistory.year, year), eq(buyYearHistory.userId, userId))
    );

  if (!_.isEmpty(result)) {
    const historyData: HistoryData[] = [];

    for (let i = 0; i < 12; i++) {
      let totalPrice = 0;

      const month = result.find((item) => item.month === i);
      if (month && month.totalPrice) {
        totalPrice =
          totalPrice < month.totalPrice ? month.totalPrice : totalPrice;
      }

      historyData.push({
        year,
        month: i,
        totalPrice,
      });
    }
    return historyData;
  }
  return [];
};

export const getSellYearHistoryData = async ({
  userId,
  year,
}: {
  userId: string;
  year: number;
}) => {
  const result = await db
    .select()
    .from(sellYearHistory)
    .orderBy(asc(sellYearHistory.month))
    .where(
      and(eq(sellYearHistory.year, year), eq(sellYearHistory.userId, userId))
    );

  if (!_.isEmpty(result)) {
    const historyData: HistoryData[] = [];

    for (let i = 0; i < 12; i++) {
      let totalPrice = 0;

      const month = result.find((item) => item.month === i);
      if (month && month.totalPrice) {
        totalPrice =
          totalPrice < month.totalPrice ? month.totalPrice : totalPrice;
      }

      historyData.push({
        year,
        month: i,
        totalPrice,
      });
    }
    return historyData;
  }
  return [];
};
