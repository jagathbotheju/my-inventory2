// import { useQueries } from "@tanstack/react-query";
// import { getSellTxPayments } from "../actions/paymentActions";

// export const useSellTxPayments = ({
//   userId,
//   invoiceNumbers,
// }: {
//   userId: string;
//   invoiceNumbers: string[];
// }) => {
//   return useQueries({
//     queries: invoiceNumbers.map((invoiceNumber) => ({
//       queryKey: ["sell-tx-payments", userId, invoiceNumber],
//       queryFn: () => getSellTxPayments({ userId, invoiceNumber }),
//       enabled: !!userId && !!invoiceNumber,
//     })),
//   });
// };
