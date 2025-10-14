"use client";
import { cn, formatPrice } from "@/lib/utils";
import Link from "next/link";

interface Props {
  stock: StockBal;
}

const StockCard = ({ stock }: Props) => {
  return (
    <Link
      href={`/stocks/${stock.productId}?stockBal=${stock.quantity}`}
      className="flex flex-col col-span-1 rounded-md border-primary border shadow hover:shadow-lg"
    >
      <div className="bg-primary/30 p-2 w-full uppercase flex flex-col font-bold">
        <p className="text-ellipsis text-xl">{stock.productNumber}</p>
        {/* balance */}
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "flex items-center gap-1 text-base rounded-md",
              stock.quantity < 0 && "bg-primary"
            )}
          >
            <p>BAL</p>
            <p>{stock.quantity}</p>
            <p className="uppercase">{stock.uom}</p>
          </div>

          <p className="text-base">
            {formatPrice(
              stock.sellTxTotalQuantity < stock.buyTxTotalQuantity
                ? stock.buyTxTotalAmount - stock.sellTxActTotalAmount
                : 0
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-col p-2">
        <div className="grid grid-cols-12 gap-2">
          <p className="col-span-4">Total Purchase</p>
          <div className="flex items-center gap-4 col-span-8">
            <div className="grid grid-cols-2 gap-1">
              <p className="justify-self-end">{stock.buyTxTotalQuantity}</p>
              <p className="uppercase justify-self-start">
                {stock && stock.uom && stock.uom.slice(0, 4)}
              </p>
            </div>
            <p>{formatPrice(stock.buyTxTotalAmount ?? 0)}</p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2">
          <p className="col-span-4">Total Sales</p>
          <div className="flex items-center gap-4 col-span-8">
            <div className="grid grid-cols-2 gap-1">
              <p className="justify-self-end">{stock.sellTxTotalQuantity}</p>
              <p className="uppercase justify-self-start">
                {stock && stock.uom && stock.uom.slice(0, 4)}
              </p>
            </div>
            <p>{formatPrice(stock.sellTxTotalAmount ?? 0)}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default StockCard;
