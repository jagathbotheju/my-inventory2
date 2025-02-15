import { useQuery } from "@tanstack/react-query";
import {
  getBuyMonthHistoryData,
  getBuyYearHistoryData,
  getSellMonthHistoryData,
  getSellYearHistoryData,
} from "../actions/historyActions";

export const useBuyMonthHistoryData = ({
  userId,
  year,
  month,
}: {
  userId: string;
  year: number;
  month: number;
}) => {
  return useQuery({
    queryKey: ["buy-month-history-data", userId, year, month],
    queryFn: () => getBuyMonthHistoryData({ userId, year, month }),
  });
};

export const useSellMonthHistoryData = ({
  userId,
  year,
  month,
}: {
  userId: string;
  year: number;
  month: number;
}) => {
  return useQuery({
    queryKey: ["sell-month-history-data", userId, year, month],
    queryFn: () => getSellMonthHistoryData({ userId, year, month }),
  });
};

export const useBuyYearHistoryData = ({
  userId,
  year,
}: {
  userId: string;
  year: number;
}) => {
  return useQuery({
    queryKey: ["buy-year-history-data", userId, year],
    queryFn: () => getBuyYearHistoryData({ userId, year }),
  });
};

export const useSellYearHistoryData = ({
  userId,
  year,
}: {
  userId: string;
  year: number;
}) => {
  return useQuery({
    queryKey: ["sell-year-history-data", userId, year],
    queryFn: () => getSellYearHistoryData({ userId, year }),
  });
};
