"use client";
import { User } from "@/server/db/schema/users";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useAllStocks } from "@/server/backend/queries/stockQueries";
import StockCard from "./StockCard";
import { useBuyTxByUser } from "@/server/backend/queries/buyTxQueries";
import { format } from "date-fns";
import { Stock } from "@/server/db/schema/stocks";

interface Props {
  user: User;
}

const Stocks = ({ user }: Props) => {
  const { data: allStocks } = useAllStocks(user?.id as string);
  const { data: userByTx } = useBuyTxByUser(user.id);

  const filteredStocks = allStocks?.reduce(
    (acc, stock: Stock) => {
      const existingStock = acc.find(
        (item) => item.productId === stock.productId
      );

      if (!existingStock) {
        acc.push({
          productId: stock.productId,
          productNumber: stock.productNumber as string,
          quantity: stock.quantity,
        });
      } else {
        existingStock.quantity += stock.quantity;
      }
      return acc;
    },
    Array<{
      productId: string;
      productNumber: string;
      quantity: number;
    }>()
  );

  return (
    <Card className="flex flex-col w-full h-fit bg-transparent dark:border-primary/40">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-4xl font-bold">
            Stocks, {format(new Date(), "yyyy-MM-dd")}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="gap-5 flex flex-wrap">
        {filteredStocks?.map((stock, index) => {
          const productBuyTx = userByTx?.filter(
            (buyTx) =>
              buyTx.productId === stock.productId && buyTx.userId === user.id
          );
          return (
            <StockCard
              key={index}
              userId={user.id}
              productId={stock.productId}
              productNumber={stock.productNumber as string}
              quantity={stock.quantity}
              buyTx={productBuyTx}
            />
          );
        })}
      </CardContent>
    </Card>
  );
};

export default Stocks;
