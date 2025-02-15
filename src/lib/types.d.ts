type BuyProduct = {
  date: Date;
  productId: string;
  quantity: number;
  supplierId: string;
  unitPrice: number;
  userId: string;
};

type TimeFrame = "month" | "year";
type Period = {
  year: number;
  month: number;
};

type HistoryData = {
  totalPrice: number;
  year: number;
  month: number;
  day?: number;
};

type ChartData = {
  buy: number;
  sell: number;
  year: number;
  month: number;
  day?: number;
};
