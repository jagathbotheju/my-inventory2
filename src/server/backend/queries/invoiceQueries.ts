import { useQuery } from "@tanstack/react-query";
import { getSellTxInvoicesForPeriod } from "../actions/invoiceActions";

export const useSellTxInvoicesForPeriod = ({
  userId,
  period,
  timeFrame,
}: {
  userId: string;
  period: Period;
  timeFrame: TimeFrame;
}) => {
  return useQuery({
    queryKey: ["tell-tx-invoices-for-period", userId, period, timeFrame],
    queryFn: () => getSellTxInvoicesForPeriod({ userId, period, timeFrame }),
  });
};
