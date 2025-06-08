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
import { formatPrice } from "@/lib/utils";

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
  const UOM =
    buyTx && buyTx[0]?.products
      ? buyTx[0].products.unitOfMeasurements.unit
      : "";

  const txSummary: Array<{
    date: string;
    txType: string;
    quantity: number;
    unitPrice: number;
    invoiceNumber?: string;
  }> = [];
  buyTx?.forEach((tx) => {
    const txDate = format(new Date(tx.date), "yyyy-MM-dd");
    const txType = "BUY";
    const txQuantity = tx.quantity;
    txSummary.push({
      date: txDate,
      txType,
      quantity: txQuantity,
      unitPrice: tx.unitPrice,
      invoiceNumber: tx.invoiceNumber ? tx.invoiceNumber : "",
    });
  });

  sellTx?.forEach((tx) => {
    const txDate = format(new Date(tx.date), "yyyy-MM-dd");
    const txType = "SELL";
    const txQuantity = tx.quantity;
    // if (tx.productId !== productId) return;
    txSummary.push({
      date: txDate,
      txType,
      quantity: txQuantity,
      unitPrice: tx.unitPrice ?? 0,
    });
  });
  txSummary.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <Dialog>
      <DialogTrigger>
        <Card className="p-0 cursor-pointer w-full hover:shadow-xl">
          <CardTitle className="text-xl text-left font-bold uppercase bg-primary/10 p-2 rounded-tr-lg rounded-tl-lg">
            {productNumber}
          </CardTitle>
          <CardContent className="p-2 flex font-semibold text-lg">
            <div className="flex gap-4">
              <p className="col-span-2 text-muted-foreground">STOCK BAL</p>
              <div className="flex gap-1">
                <p className="uppercase text-muted-foreground">{UOM}</p>
                <p className="col-span-1 text-muted-foreground">{quantity}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>
            Product,{" "}
            <span className="text-primary uppercase">{productNumber}</span>{" "}
            Stock History
          </DialogTitle>
          <DialogDescription className="hidden">
            product stock history
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 w-full">
          <div className="grid gap-1 grid-cols-10 font-semibold text-lg border-b">
            <p className="col-span-2 font-bold">Date</p>
            <p className="col-span-2 font-bold">Invoice Number</p>
            <p className="col-span-2 font-bold">Tx.Type</p>
            <p className="col-span-2 font-bold">Unit Price</p>
            <p className="flex gap-1 col-span-2">Quantity</p>
          </div>

          <div className="flex flex-col gap-1 max-h-96 overflow-y-auto">
            {/* buy transitions */}
            {txSummary?.map((tx, index) => (
              <div
                key={index}
                className={`grid gap-1 grid-cols-10 text-lg hover:bg-secondary ${
                  tx.txType === "BUY" ? "text-green-500" : "text-red-500"
                }`}
              >
                {/* data */}
                <p className="col-span-2">{tx.date}</p>
                <p className="col-span-2 uppercase">
                  {tx.invoiceNumber ? tx.invoiceNumber : ""}
                </p>
                <p className="col-span-2">{tx.txType}</p>
                <p className="col-span-2">{formatPrice(tx.unitPrice)}</p>
                <div className="flex gap-1 col-span-2">
                  <p className="uppercase">{UOM}</p>
                  <p className="">{tx.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-1" />
          {/* final balance */}
          <div className="grid gap-1 grid-cols-10 font-semibold text-lg">
            <p className="col-span-2">{format(new Date(), "yyyy-MM-dd")}</p>
            <p className="col-span-6">FINAL BAL</p>
            <div className="flex gap-1 col-span-2">
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
