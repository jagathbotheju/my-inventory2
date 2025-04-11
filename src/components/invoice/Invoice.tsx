"use client";
import { User } from "@/server/db/schema/users";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import TimeFramePicker from "../TimeFramePicker";
import { useTimeFrameStore } from "@/store/timeFrameStore";
import { useBuyTxByUserByPeriod } from "@/server/backend/queries/buyTxQueries";

interface Props {
  user: User;
}

const Invoice = ({ user }: Props) => {
  const { period, timeFrame } = useTimeFrameStore((state) => state);
  const { data: buyTxs } = useBuyTxByUserByPeriod({
    // userId: user.id,
    userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
    period,
    timeFrame,
  });

  console.log("buyTxs", buyTxs, user);

  return (
    <Card className="dark:bg-transparent dark:border-primary/40">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-4xl font-bold">Buy Products</CardTitle>
          <TimeFramePicker />
        </div>
      </CardHeader>
      <CardContent>Invoice</CardContent>
    </Card>
  );
};

export default Invoice;
