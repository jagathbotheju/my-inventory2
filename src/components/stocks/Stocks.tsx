"use client";
import { User } from "@/server/db/schema/users";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useAllUserStocks } from "@/server/backend/queries/stockQueries";
import { format } from "date-fns";
import _ from "lodash";
import Link from "next/link";

interface Props {
  user: User;
}

const Stocks = ({ user }: Props) => {
  const { data: allUserStocks } = useAllUserStocks(user?.id as string);
  // const { data: allUserStocks } = useAllUserStocks(
  //   "7e397cd1-19ad-4c68-aa50-a77c06450bc7"
  // );

  return (
    <Card className="flex flex-col w-full h-fit bg-transparent dark:border-primary/40">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-4xl font-bold">
            Stock Balance, {format(new Date(), "yyyy-MM-dd")}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="gap-5 grid grid-cols-3">
        {_.sortBy(allUserStocks, "productNumber")?.map((stock, index) => (
          <Link
            href={`/stocks/${stock.productId}?stockBal=${stock.quantity}`}
            key={index}
            className="flex flex-col items-center col-span-1 rounded-md border-primary border"
          >
            <div className="bg-primary/30 p-2 text-xl w-full font-semibold uppercase">
              {stock.productNumber}
            </div>
            {/* <div>{stock.productId}</div> */}
            <div className="p-2 text-xl font-semibold w-full text-center">
              {stock.quantity}
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
};

export default Stocks;
