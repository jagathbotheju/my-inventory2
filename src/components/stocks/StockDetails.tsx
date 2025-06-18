"use client";

import { User } from "@/server/db/schema/users";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useBuyTxByUserProduct } from "@/server/backend/queries/buyTxQueries";
import { useSellTxByUserProduct } from "@/server/backend/queries/sellTxQueries";
import { format } from "date-fns";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { ScrollArea } from "../ui/scroll-area";
import { Loader2Icon } from "lucide-react";

interface Props {
  user: User;
  productId: string;
  stockBal: string;
}

const StockDetails = ({ user, productId, stockBal }: Props) => {
  const router = useRouter();
  let totalBuyStock = 0;
  let totalSellStock = 0;
  const { data: buyTxs, isLoading: buyTxsLoading } = useBuyTxByUserProduct({
    userId: user.id,
    // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
    productId,
  });

  const { data: sellTxs, isLoading: sellTxsLoading } = useSellTxByUserProduct({
    userId: user.id,
    // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
    productId,
  });

  return (
    <Card className="flex flex-col w-full h-fit bg-transparent dark:border-primary/40">
      <CardHeader>
        <CardTitle className="text-4xl font-bold flex gap-3 items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center">
              <p>Stock History,</p>
              <p>{buyTxs?.length && buyTxs[0]?.productNumber}</p>
            </div>
            <p className="text-sm">{productId}</p>
          </div>
          <div className="flex items-center gap-2">
            <p>BAL</p>
            <p>{stockBal}</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex justify-between w-full gap-6">
          {/* left */}
          {buyTxsLoading ? (
            <div className="flex w-full p-8 items-center justify-center">
              <Loader2Icon className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col w-full">
              <div className="border border-b-primary w-full border-l-transparent border-t-transparent border-r-transparent mb-4">
                <h3 className="text-2xl font-semibold text-muted-foreground pl-4">
                  BUY
                </h3>
              </div>

              <ScrollArea className="h-[30rem] w-full rounded-md border border-transparent">
                {buyTxs?.map((item, index) => {
                  totalBuyStock += item.quantity;
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between px-4 mb-1"
                    >
                      <p>{format(item.date, "yyyy-MM-dd")}</p>
                      <div className="flex items-center gap-2">
                        <p>{item.quantity}</p>
                        <p className="uppercase">
                          {item.products?.unitOfMeasurements?.unit}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </ScrollArea>

              {buyTxs && buyTxs.length && totalBuyStock && totalBuyStock ? (
                <div className="self-end px-4 flex gap-1 border-t-[1px] border-t-primary border-b-primary border-b-2 mt-1 font-semibold text-lg">
                  <p>{Intl.NumberFormat("en-IN").format(totalBuyStock)}</p>
                  <p className="uppercase">
                    {buyTxs?.length &&
                      buyTxs[0]?.products?.unitOfMeasurements?.unit}
                  </p>
                </div>
              ) : null}
            </div>
          )}

          {/* right */}
          {sellTxsLoading ? (
            <div className="flex w-full p-8 items-center justify-center">
              <Loader2Icon className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col w-full">
              <div className="border border-b-primary w-full border-l-transparent border-t-transparent border-r-transparent mb-4">
                <h3 className="text-2xl font-semibold text-muted-foreground pl-4">
                  SELL
                </h3>
              </div>

              <ScrollArea className="h-[30rem] w-full rounded-md border border-transparent">
                {sellTxs && sellTxs.length ? (
                  sellTxs?.map((item, index) => {
                    totalSellStock += item.quantity;
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between px-4 mb-1"
                      >
                        <p>{format(item.date, "yyyy-MM-dd")}</p>
                        <div className="flex items-center gap-2">
                          <p>{item.quantity}</p>
                          <p className="uppercase">
                            {item.products?.unitOfMeasurements?.unit}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-muted-foreground text-center font-semibold">
                    No Sell Transactions Found!
                  </p>
                )}
              </ScrollArea>

              {sellTxs && sellTxs.length && totalSellStock ? (
                <div className="self-end px-4 flex gap-1 border-t-[1px] border-t-primary border-b-primary border-b-2 mt-1 font-semibold text-lg">
                  <p>{Intl.NumberFormat("en-IN").format(totalSellStock)}</p>
                  <p className="uppercase">
                    {buyTxs?.length &&
                      buyTxs[0]?.products?.unitOfMeasurements?.unit}
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="self-end mt-8">
          <Button onClick={() => router.back()}>BACK</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockDetails;
