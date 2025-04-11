"use client";
import React from "react";
import { useTimeFrameStore } from "@/store/timeFrameStore";
import MonthSelector from "./MonthSelector";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import YearSelector from "./BuyYearSelector";

const TimeFramePicker = () => {
  const { timeFrame, setTimeFrame } = useTimeFrameStore((state) => state);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Tabs
        value={timeFrame}
        onValueChange={(value) => {
          setTimeFrame(value as TimeFrame);
        }}
      >
        <TabsList>
          <TabsTrigger
            className="data-[state=active]:bg-primary/70 data-[state=active]:font-semibold"
            value="year"
          >
            Year
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:bg-primary/70 data-[state=active]:font-semibold"
            value="month"
          >
            Month
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap items=center gap-2">
        <YearSelector />

        {timeFrame === "month" && <MonthSelector />}
      </div>
    </div>
  );
};

export default TimeFramePicker;
