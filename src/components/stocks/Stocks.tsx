"use client";
import { User } from "@/server/db/schema/users";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useAllStocks } from "@/server/backend/queries/stockQueries";
import StockCard from "./StockCard";
import { useBuyTxByUser } from "@/server/backend/queries/buyTxQueries";
import { format } from "date-fns";

interface Props {
  user: User;
}

const Stocks = ({ user }: Props) => {
  const { data: allStocks } = useAllStocks(user?.id as string);
  const { data: userByTx } = useBuyTxByUser(user.id);
  // console.log("userByTx", userByTx);

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
        {allStocks?.map((stock, index) => {
          const productBuyTx = userByTx?.filter(
            (buyTx) =>
              buyTx.productId === stock.productId && buyTx.userId === user.id
          );
          console.log("productBuyTx", productBuyTx);
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
