"use client";
import { BuyTransactionExt } from "@/server/db/schema/buyTransactions";
import { Card, CardContent, CardTitle } from "../ui/card";
import { format } from "date-fns";
import { Separator } from "../ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useSellTxByUserProduct } from "@/server/backend/queries/sellTxQueries";

interface Props {
  userId: string;
  productId: string;
  productNumber: string;
  quantity: number;
  buyTx: BuyTransactionExt[] | undefined;
}

const StockCard = ({
  userId,
  productId,
  productNumber,
  quantity,
  buyTx,
}: Props) => {
  const { data: sellTx } = useSellTxByUserProduct({ userId, productId });
  const UOM = buyTx ? buyTx[0].products.unitOfMeasurements.unit : "";
  const txSummary: Array<{
    date: string;
    txType: string;
    quantity: number;
  }> = [];
  buyTx?.forEach((tx) => {
    const txDate = format(new Date(tx.date), "yyyy-MM-dd");
    const txType = "BUY";
    const txQuantity = tx.quantity;
    txSummary.push({ date: txDate, txType, quantity: txQuantity });
  });
  sellTx?.forEach((tx) => {
    const txDate = format(new Date(tx.date), "yyyy-MM-dd");
    const txType = "SELL";
    const txQuantity = tx.quantity;
    txSummary.push({ date: txDate, txType, quantity: txQuantity });
  });
  txSummary.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <Dialog>
      <DialogTrigger>
        <Card className="p-0 cursor-pointer">
          <CardTitle className="text-2xl font-bold uppercase bg-primary/40 p-2 text-center rounded-tr-lg rounded-tl-lg">
            {productNumber}
          </CardTitle>
          <CardContent className="p-2 flex items-center justify-center font-semibold text-lg">
            <div className="flex gap-4">
              <p className="col-span-2">stock balance</p>
              <div className="flex gap-1">
                <p className="uppercase">{UOM}</p>
                <p className="col-span-1">{quantity}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Product, <span className="text-primary">{productNumber}</span> Stock
            History
          </DialogTitle>
          <DialogDescription className="hidden">
            product stock history
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1 max-h-96 overflow-y-auto">
            {/* buy transitions */}
            {txSummary?.map((tx, index) => (
              <div key={index} className="grid gap-1 grid-cols-6">
                <p className="col-span-2">
                  {format(new Date(tx.date), "yyyy-MM-dd")}
                </p>
                <p className="col-span-2">{tx.txType}</p>
                <div className="flex gap-1">
                  {tx.txType === "BUY" ? "+" : "-"}
                  <p className="uppercase">{UOM}</p>
                  <p className="col-span-2">{tx.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-1" />
          {/* final balance */}
          <div className="grid gap-1 grid-cols-6 font-semibold text-lg">
            <p className="col-span-2">{format(new Date(), "yyyy-MM-dd")}</p>
            <p className="col-span-2">FINAL BAL</p>
            <div className="flex gap-1">
              <p className="uppercase">{UOM}</p>
              <p className="col-span-2">{quantity}</p>
            </div>
          </div>
          <Separator className="bg-primary/40" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StockCard;
