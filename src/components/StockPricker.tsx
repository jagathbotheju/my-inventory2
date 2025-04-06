"use client";
import { useStocks } from "@/server/backend/queries/stockQueries";
import { Stock } from "@/server/db/schema/stocks";
import { Check, ChevronsUpDown, Loader2Icon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useState } from "react";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { cn, formatPrice } from "@/lib/utils";
import { ProductExt } from "@/server/db/schema/products";

interface Props {
  userId: string;
  supplierId: string;
  product: ProductExt | undefined;
  setStockProduct: (stockProduct: Stock) => void;
}

const StockPricker = ({
  userId,
  supplierId,
  product,
  setStockProduct,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const { data: stocks, isLoading } = useStocks({
    userId,
    supplierId,
    productId: product?.id as string,
  });
  // const filteredStocks = stocks?.reduce((acc: Stock[], stock: Stock) => {
  //   const existingStock = acc.find(
  //     (item) =>
  //       item.productId === stock.productId && item.unitPrice === stock.unitPrice
  //   );
  //   if (!existingStock) {
  //     acc.push(stock);
  //   } else {
  //     existingStock.quantity += stock.quantity;
  //   }
  //   return acc;
  // }, []);
  const selectedStock = stocks?.find(
    (item) => `${item.productId}${item.unitPrice}${item.quantity}` === value
  );

  return (
    <div className="flex">
      {isLoading ? (
        <Loader2Icon className="w-4 h-4 animate-spin" />
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild className="dark:bg-slate-900">
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {selectedStock ? (
                <div className="flex gap-2">
                  <div>Product Number : </div>
                  <p className="text-primary font-semibold">{`${product?.productNumber}`}</p>
                  <div>Purchased Price : </div>
                  <p className="text-primary font-semibold">
                    {formatPrice(+`${selectedStock.unitPrice}`)}
                  </p>
                  <div>Stock BAL : </div>
                  <p className="text-primary font-semibold">{`${selectedStock.quantity}`}</p>
                </div>
              ) : (
                "Select Product..."
              )}

              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 dark:bg-slate-900 w-full">
            <Command className="dark:bg-slate-900 w-full">
              <CommandInput
                placeholder="Search suppliers..."
                className="w-full"
              />
              <CommandList>
                <CommandEmpty>No products found</CommandEmpty>
                <CommandGroup>
                  {stocks?.map((item, index) => (
                    <CommandItem
                      key={index}
                      value={item.productId + item.unitPrice + item.quantity}
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? "" : currentValue);
                        setStockProduct(item);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value ===
                            `${item.productId}${item.unitPrice}${item.quantity}`
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex gap-2">
                        <div>Product Number : </div>
                        <p className="text-primary font-semibold">{`${product?.productNumber}`}</p>
                        <div>Purchased Price : </div>
                        <p className="text-primary font-semibold">
                          {formatPrice(+`${item.unitPrice}`)}
                        </p>
                        <div>Stock BAL : </div>
                        <p className="text-primary font-semibold">{`${item.quantity}`}</p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default StockPricker;
