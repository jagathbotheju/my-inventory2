import { useQuery } from "@tanstack/react-query";
import { getExpenses, totalExpenses } from "../actions/expenseActions";

//-user-expenses---
export const useExpenses = ({
  userId,
  period,
  timeFrame,
}: {
  userId: string;
  period: Period;
  timeFrame: TimeFrame;
}) => {
  return useQuery({
    queryKey: ["expenses", userId, period, timeFrame],
    queryFn: () => getExpenses({ userId, period, timeFrame }),
  });
};

export const useTotalExpenses = ({
  userId,
  period,
  timeFrame,
}: {
  userId: string;
  period: Period;
  timeFrame: TimeFrame;
}) => {
  return useQuery({
    queryKey: ["total-expenses", userId, period, timeFrame],
    queryFn: () => totalExpenses({ userId, period, timeFrame }),
  });
};
