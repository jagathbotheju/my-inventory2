import { create } from "zustand";

export type TimeFrameStore = {
  timeFrame: "month" | "year";
  period: Period;
  setTimeFrame: (timeFrame: "month" | "year") => void;
  setPeriod: (period: Period) => void;
};

export const useTimeFrameStore = create<TimeFrameStore>()((set) => ({
  timeFrame: "month",
  period: {
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  },
  setTimeFrame: (timeFrame) => {
    set(() => ({
      timeFrame,
    }));
  },

  setPeriod: (period) => {
    set(() => ({
      period,
    }));
  },
}));
