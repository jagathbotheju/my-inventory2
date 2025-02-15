"use client";
import { cn, formatPrice } from "@/lib/utils";
import { TooltipProps } from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
// import { format, addDays, addMonths } from "date-fns";
import _ from "lodash";

interface Props extends TooltipProps<ValueType, NameType> {
  timeFrame: "month" | "year";
}

const CustomTooltip = ({ active, payload }: Props) => {
  if (!active || !payload || payload.length === 0) return null;
  const sellData = payload[0]?.payload as ChartData;
  const buyData = payload[1]?.payload as ChartData;
  // console.log("sellData", sellData.sell);
  // console.log("buyData", buyData?.buy);

  const TooltipRow = ({
    label,
    value,
    bgColor,
    textColor,
  }: {
    label: string;
    bgColor: string;
    textColor: string;
    value: number;
  }) => (
    <div className="flex flex-col items-center">
      <div className="flex gap-2 items-center">
        <div className={cn("h-4 w-4 rounded-full", bgColor)} />
        <div className="flex w-full justify-between">
          <p className={cn("text-sm text-muted-foreground", textColor)}>
            {label}
          </p>
          <div className={cn("font-bold text-sm gap-1", textColor)}>
            {formatPrice(value)}
          </div>
        </div>
      </div>
    </div>
  );

  // if (sellData.sell && buyData.buy === 0) {
  //   return null;
  // }

  // if (sellData.sell === 0) return null;
  // if (buyData.buy === 0) return null;

  return (
    <>
      {sellData?.sell !== 0 && (
        <div className="p-2 rounded-md bg-background">
          <TooltipRow
            label="sell"
            value={sellData?.sell}
            bgColor="bg-green-500"
            textColor="text-green-500"
          />
        </div>
      )}
      {!_.isEmpty(buyData) && buyData.buy !== 0 && (
        <div className="p-2 rounded-md bg-background">
          <TooltipRow
            label="buy"
            value={buyData.buy}
            bgColor="bg-blue-500"
            textColor="text-blue-500"
          />
        </div>
      )}
    </>
  );
};

export default CustomTooltip;
