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

type Payload = {
  payload: ChartData;
};

type TxCheques =
  | {
      chequeNumber?: string | undefined;
      bankName?: string | undefined;
      amount?: number | undefined;
      chequeDate?: Date | undefined;
    }[]
  | undefined;

type TxPayments = {
  userId: string;
  invoiceNumber: string;
  paymentMode: string;
  cacheAmount?: number;
  cheques?: [
    {
      chequeNumber?: string;
      bankName?: string;
      amount?: number;
      chequeDate?: Date;
    }
  ];
};

type StockBal = {
  productNumber: string;
  productId: string;
  quantity: number;
  buyTxTotalQuantity: number;
  buyTxTotalAmount: number;
  sellTxTotalQuantity: number;
  sellTxTotalAmount: number;
  uom: string;
};

type ChequeData = {
  chequeNumber?: string | undefined;
  chequeDate?: Date | undefined;
  bankName?: string | undefined;
  amount?: number | undefined;
};
