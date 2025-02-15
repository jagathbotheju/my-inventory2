"use client";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useTimeFrameStore } from "@/store/timeFrameStore";
import { useBuyTxYears } from "@/server/backend/queries/buyTxQueries";
import _ from "lodash";

const BuyYearSelector = () => {
  const { period, setPeriod } = useTimeFrameStore((state) => state);
  const { data: buyTxYears } = useBuyTxYears();

  return (
    <Select
      value={period.year.toString()}
      onValueChange={(value) => {
        setPeriod({
          month: period.month,
          year: parseInt(value),
        });
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {buyTxYears?.length ? (
          buyTxYears?.map((item) => {
            return (
              <SelectItem
                key={_.uniqueId()}
                value={item.year?.toString() ?? ""}
              >
                {item.year}
              </SelectItem>
            );
          })
        ) : (
          <SelectItem
            key={_.uniqueId()}
            value={new Date().getFullYear().toString()}
          >
            {new Date().getFullYear()}
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
};

export default BuyYearSelector;
