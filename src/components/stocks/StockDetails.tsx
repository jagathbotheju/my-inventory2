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
import { formatPrice } from "@/lib/utils";
import _ from "lodash";
import { Separator } from "../ui/separator";

interface Props {
  user: User;
  productId: string;
  stockBal: string;
}

const StockDetails = ({ user, productId, stockBal }: Props) => {
  const router = useRouter();
  const { data: buyTxs, isLoading: buyTxsLoading } = useBuyTxByUserProduct({
    userId: user.id,
    // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
    productId,
  });
  const totalBuy = buyTxs?.reduce(
    (acc, item) => {
      return {
        totalBuyAmount: acc.totalBuyAmount + item.unitPrice * item.quantity,
        totalBuyStock: acc.totalBuyStock + item.quantity,
      };
    },
    {
      totalBuyAmount: 0,
      totalBuyStock: 0,
    }
  );

  const { data: sellTxs, isLoading: sellTxsLoading } = useSellTxByUserProduct({
    userId: user.id,
    // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
    productId,
  });
  const totalSell = sellTxs?.reduce(
    (acc, item) => {
      return {
        totalSellAmount: acc.totalSellAmount + item.unitPrice! * item.quantity,
        totalActSellAmount:
          acc.totalActSellAmount + item.purchasedPrice! * item.quantity,
        totalSellStock: acc.totalSellStock + item.quantity,
      };
    },
    {
      totalSellAmount: 0,
      totalSellStock: 0,
      totalActSellAmount: 0,
    }
  );

  return (
    <Card className="flex flex-col w-full h-fit bg-transparent dark:border-primary/40">
      <CardHeader>
        <CardTitle className="text-3xl font-bold flex gap-3 items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center">
              <p>Stock History,</p>
              <p className="uppercase text-primary">
                {buyTxs?.length && buyTxs[0]?.products.productNumber}
              </p>
            </div>
            {/* <p className="text-sm">{productId}</p> */}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <p>Stock BAL</p>
              <p>{stockBal}</p>
            </div>
            <Separator orientation="vertical" className="h-6 w-1 bg-primary" />
            <div className="flex items-center gap-2">
              <p>AMT</p>
              <p>
                {formatPrice(
                  totalBuy &&
                    totalSell &&
                    totalSell.totalSellStock < totalBuy.totalBuyStock
                    ? (totalBuy?.totalBuyAmount ?? 0) -
                        (totalSell?.totalActSellAmount ?? 0)
                    : 0
                )}
              </p>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex justify-between w-full gap-6">
          {/* LEFT */}
          {buyTxsLoading ? (
            <div className="flex w-full p-8 items-center justify-center">
              <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex flex-col w-full">
              <div className="border border-b-primary w-full border-l-transparent border-t-transparent border-r-transparent mb-4">
                <h3 className="text-2xl font-semibold text-muted-foreground pl-4">
                  BUY
                </h3>
              </div>

              <ScrollArea className="h-[30rem] w-full rounded-md border border-transparent px-2">
                {_.sortBy(buyTxs, ["date", "unitPrice"])?.map((item, index) => {
                  return (
                    <div key={index} className="grid grid-cols-12 gap-2">
                      <p className="col-span-3">
                        {format(item.date, "yyyy-MM-dd")}
                      </p>

                      <div className="col-span-9">
                        <div className="grid grid-cols-12 gap-1">
                          <p className="col-span-4 px-2">
                            {formatPrice(item.unitPrice)}
                          </p>
                          <p>X</p>
                          <div className="flex items-center gap-1 col-span-2">
                            <p>{item.quantity}</p>
                            <p className="uppercase">
                              {item.products?.unitOfMeasurements?.unit}
                            </p>
                          </div>
                          <p>=</p>

                          <p className="font-semibold col-span-4 justify-self-end">
                            {formatPrice(item.unitPrice * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </ScrollArea>

              {/* TOTAL */}
              {buyTxs && buyTxs.length && totalBuy?.totalBuyStock ? (
                <div className="flex items-center justify-end px-4 mt-6 gap-4 border-t-[1px] border-t-primary border-b-primary border-b-2 font-semibold text-lg w-full">
                  <p>Total Purchase</p>
                  <div className="flex items-center gap-1">
                    <p>
                      {Intl.NumberFormat("en-IN").format(
                        totalBuy.totalBuyStock
                      )}
                    </p>
                    <p className="uppercase">
                      {buyTxs?.length &&
                        buyTxs[0]?.products?.unitOfMeasurements?.unit}
                    </p>
                  </div>
                  <p className="text-primary">
                    {formatPrice(totalBuy.totalBuyAmount)}
                  </p>
                </div>
              ) : null}
            </div>
          )}

          {/* right */}
          {sellTxsLoading ? (
            <div className="flex w-full p-8 items-center justify-center">
              <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex flex-col w-full">
              <div className="border border-b-primary w-full border-l-transparent border-t-transparent border-r-transparent mb-4">
                <h3 className="text-2xl font-semibold text-muted-foreground pl-4">
                  SELL
                </h3>
              </div>

              <ScrollArea className="h-[30rem] w-full rounded-md border border-transparent px-2">
                {sellTxs && sellTxs.length && totalSell ? (
                  _.sortBy(sellTxs, ["date", "unitPrice"])?.map(
                    (item, index) => {
                      return (
                        <div key={index} className="grid grid-cols-12 gap-2">
                          <p className="col-span-3">
                            {format(item.date, "yyyy-MM-dd")}
                          </p>

                          <div className="col-span-9">
                            <div className="grid grid-cols-12 gap-1">
                              <p className="col-span-4">
                                {formatPrice(item.unitPrice ?? 0)}
                              </p>
                              <p>X</p>
                              <div className="flex items-center gap-1 col-span-2">
                                <p>{item.quantity}</p>
                                <p className="uppercase">
                                  {item.products?.unitOfMeasurements?.unit}
                                </p>
                              </div>
                              <p>=</p>

                              <p className="font-semibold col-span-4 justify-self-end">
                                {formatPrice(
                                  (item.unitPrice ?? 0) * item.quantity
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )
                ) : (
                  <p className="text-muted-foreground text-center font-semibold">
                    No Sell Transactions Found!
                  </p>
                )}
              </ScrollArea>

              {/* TOTAL */}
              {sellTxs && sellTxs.length && totalSell ? (
                <div className="flex items-center justify-end px-4 gap-4 border-t-[1px] border-t-primary border-b-primary border-b-2 mt-6 font-semibold text-lg w-full">
                  <p>Total Sales</p>
                  <div className="flex items-center gap-1">
                    <p>
                      {Intl.NumberFormat("en-IN").format(
                        totalSell.totalSellStock
                      )}
                    </p>

                    <p className="uppercase">
                      {buyTxs?.length &&
                        buyTxs[0]?.products?.unitOfMeasurements?.unit}
                    </p>
                  </div>
                  <p className="text-primary">
                    {formatPrice(totalSell.totalSellAmount)}
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
