"use client";
import {
  useBuyMonthHistoryData,
  useBuyYearHistoryData,
  useSellMonthHistoryData,
  useSellYearHistoryData,
} from "@/server/backend/queries/historyQueries";
import { User } from "@/server/db/schema/users";
import { useTimeFrameStore } from "@/store/timeFrameStore";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Loader2Icon } from "lucide-react";
import _ from "lodash";
import { getDaysInMonth } from "date-fns";
import {
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
} from "recharts";
import CustomTooltip from "../CustomTooltip";
import { getFullMonth } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { MouseEvent } from "react";

interface Props {
  user: User;
}

const TransactionsCharts = ({ user }: Props) => {
  const router = useRouter();
  const { period, timeFrame } = useTimeFrameStore((state) => state);
  const { data: buyMonthHistoryData, isLoading: buyMonthHistoryDataLoading } =
    useBuyMonthHistoryData({
      userId: user.id,
      year: period.year,
      month: period.month,
    });
  const { data: sellMonthHistoryData, isLoading: sellMonthHistoryDataLoading } =
    useSellMonthHistoryData({
      userId: user.id,
      year: period.year,
      month: period.month,
    });

  const { data: buyYearHistoryData } = useBuyYearHistoryData({
    userId: user.id,
    year: period.year,
  });
  const { data: sellYearHistoryData } = useSellYearHistoryData({
    userId: user.id,
    year: period.year,
  });

  //year history data
  const yearHistoryData = () => {
    const yearData = [] as ChartData[];

    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((month) => {
      const buyMonth = buyYearHistoryData?.length
        ? buyYearHistoryData[month]
        : ({} as HistoryData);
      const sellMonth = sellYearHistoryData?.length
        ? sellYearHistoryData[month]
        : ({} as HistoryData);
      const data: ChartData = {
        buy: buyMonth?.totalPrice ?? 0,
        sell: sellMonth.totalPrice ?? 0,
        month: buyMonth.month,
        year: buyMonth.year,
      };
      yearData.push(data);
    });

    return yearData;
  };
  const yearHistoryChartData = yearHistoryData();

  //month history data
  const monthHistoryData = () => {
    const monthData = [] as ChartData[];
    const daysInMonth = getDaysInMonth(new Date(period.year, period.month - 1));

    for (let i = 0; i <= daysInMonth; i++) {
      const buyMonthDate = buyMonthHistoryData?.length
        ? buyMonthHistoryData[i]
        : ({} as HistoryData);
      const sellMonthDate = sellMonthHistoryData?.length
        ? sellMonthHistoryData[i]
        : ({} as HistoryData);

      const data: ChartData = {
        buy: buyMonthDate?.totalPrice ?? 0,
        sell: sellMonthDate?.totalPrice ?? 0,
        day: buyMonthDate?.day,
        month: buyMonthDate?.month,
        year: buyMonthDate?.year,
      };
      monthData.push(data);
    }

    return monthData;
  };
  const monthHistoryChartData = monthHistoryData();

  return (
    <Card className="flex flex-col w-full h-fit bg-transparent dark:border-primary/40">
      <CardHeader className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-4xl font-bold">
            {timeFrame === "month" ? `${getFullMonth(period.month)}` : ``}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {buyMonthHistoryDataLoading || sellMonthHistoryDataLoading ? (
          <div className="flex w-full items-center justify-center">
            <Loader2Icon className="w-6 h-6 animate-spin" />
          </div>
        ) : _.isEmpty(buyMonthHistoryData) ? (
          <Card className="flex h-[300px] flex-col items-center justify-center bg-background dark:bg-transparent">
            No Data for the selected period!
            <p className="text-sm text-muted-foreground">
              Try selecting different period or adding new Transactions
            </p>
          </Card>
        ) : (
          <ResponsiveContainer width={"100%"} height={300}>
            <LineChart
              width={500}
              height={300}
              data={
                timeFrame === "month"
                  ? monthHistoryChartData
                  : yearHistoryChartData
              }
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={timeFrame === "month" ? "day" : "month"} dy={5} />
              <YAxis />
              <Legend />
              {/* sell transactions */}
              <Line
                strokeWidth={2}
                type="monotone"
                dataKey="sell"
                stroke="#22c55e"
                activeDot={{
                  r: 5,
                  cursor: "pointer",
                  onClick: (event, payload) => {
                    const data = payload as MouseEvent<
                      SVGCircleElement,
                      globalThis.MouseEvent
                    > & {
                      payload: ChartData;
                    };
                    router.push(
                      `/transactions/daily?date=${data.payload.day}&month=${data.payload.month}&year=${data.payload.year}`
                    );
                  },
                }}
              />
              {/* buy transactions */}
              <Line
                strokeWidth={2}
                type="monotone"
                stroke="#3b82f6"
                dataKey="buy"
                activeDot={{
                  r: 5,
                  cursor: "pointer",
                  onClick: (event, payload) => {
                    const data = payload as MouseEvent<
                      SVGCircleElement,
                      globalThis.MouseEvent
                    > & {
                      payload: ChartData;
                    };
                    router.push(
                      `/transactions/daily?date=${data.payload.day}&month=${data.payload.month}&year=${data.payload.year}`
                    );
                  },
                }}
              />

              <Tooltip
                filterNull
                cursor={{ opacity: 0.1 }}
                content={(props) => (
                  <CustomTooltip timeFrame={timeFrame} {...props} />
                )}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
export default TransactionsCharts;
