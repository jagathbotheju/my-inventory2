import { useQuery } from "@tanstack/react-query";
import { getSellTxInvoicesForPeriod } from "../actions/invoiceActions";

export const useSellTxInvoicesForPeriod = ({
  userId,
  period,
  timeFrame,
  searchTerm,
  isSellTx,
}: {
  userId: string;
  period: Period;
  timeFrame: TimeFrame;
  searchTerm: string;
  isSellTx: boolean;
}) => {
  return useQuery({
    queryKey: [
      "tell-tx-invoices-for-period",
      userId,
      period,
      timeFrame,
      searchTerm,
    ],
    queryFn: () =>
      getSellTxInvoicesForPeriod({ userId, period, timeFrame, searchTerm }),
    enabled: isSellTx,
  });
};
