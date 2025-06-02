// "use server";
// import { db } from "@/server/db";
// import { sellTxCheques, sellTxPayments } from "@/server/db/schema";
// import { SellTxPayments } from "@/server/db/schema/sellTxPayments";
// import { and, eq } from "drizzle-orm";

// export const getSellTxPayments = async ({
//   userId,
//   invoiceNumber,
// }: {
//   userId: string;
//   invoiceNumber: string;
// }) => {
//   console.log("userId", userId);
//   console.log("invoiceNumber", invoiceNumber);
//   // const transactions = await db.query.sellTxPayments.findMany({
//   //   where: and(
//   //     eq(sellTxPayments.userId, userId),
//   //     eq(sellTxPayments.invoiceNumber, invoiceNumber)
//   //   ),
//   // });
//   const transactions = await db
//     .select({
//       id: sellTxPayments.id,
//       userId: sellTxPayments.userId,
//       invoiceNumber: sellTxPayments.invoiceNumber,
//       paymentMode: sellTxPayments.paymentMode,
//       cacheAmount: sellTxPayments.cacheAmount,
//       createdAt: sellTxPayments.createdAt,
//       cheques: {
//         id: sellTxCheques.id,
//         userId: sellTxCheques.userId,
//         invoiceNumber: sellTxCheques.invoiceNumber,
//         chequeNumber: sellTxCheques.chequeNumber,
//         amount: sellTxCheques.amount,
//         bankName: sellTxCheques.bankName,
//         chequeDate: sellTxCheques.chequeDate,
//       },
//     })
//     .from(sellTxPayments)
//     .leftJoin(
//       sellTxCheques,
//       and(
//         eq(sellTxPayments.invoiceNumber, sellTxCheques.invoiceNumber),
//         eq(sellTxPayments.userId, sellTxCheques.userId)
//       )
//     );
//   console.log("sellTxPayments", transactions);

//   return transactions as SellTxPayments[];
// };
