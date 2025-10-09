"use client";

import { useProductById } from "@/server/backend/queries/productQueries";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CalendarIcon, Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SellProductSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn, formatPrice } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";
import { useAddSellTransaction } from "@/server/backend/mutations/sellTxMutations";
import { SellTransaction } from "@/server/db/schema/sellTransactions";
import { Customer } from "@/server/db/schema/customer";
import { useState } from "react";
import CustomerPicker from "../CustomerPicker";
import { toast } from "sonner";
// import { useStocks } from "@/server/backend/queries/stockQueries";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "../ui/table";
import { Stock } from "@/server/db/schema/stocks";
import StockPricker from "../StockPricker";

interface Props {
  productId: string;
  userId: string;
}

const SellProduct = ({ productId, userId }: Props) => {
  const router = useRouter();
  const [openCalendar, setOpenCalendar] = useState(false);
  const [customer, setCustomer] = useState<Customer>({} as Customer);
  const [stockProduct, setStockProduct] = useState<Stock>({} as Stock);
  const { data: product, isLoading } = useProductById({ productId, userId });
  const { mutate: addSellTransaction, isPending } = useAddSellTransaction();

  const form = useForm<z.infer<typeof SellProductSchema>>({
    resolver: zodResolver(SellProductSchema),
    defaultValues: {
      unitPrice: 0,
      quantity: 0,
      date: new Date(),
      invoiceNumber: "",
    },
    mode: "all",
  });

  const onSubmit = (formData: z.infer<typeof SellProductSchema>) => {
    if (!customer.id) return toast.error("Please select customer");
    const data = {
      userId,
      customerId: customer.id,
      supplierId: product?.suppliers.id as string,
      date: formData.date.toDateString(),
      invoiceNumber: formData.invoiceNumber,

      productId,
      unitPrice: formData.unitPrice,
      purchasedPrice: stockProduct.unitPrice,
      quantity: formData.quantity,
    } as SellTransaction;
    addSellTransaction({ data, supplierId: product?.suppliers.id as string });
  };

  return (
    <Card className="dark:bg-transparent dark:border-primary/40 relative">
      <CardHeader>
        <CardTitle className="text-4xl font-bold">Sell Products</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex w-full justify-center items-center">
            <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-12 gap-4"
            >
              {/* customers */}
              <p className="whitespace-nowrap text-2xl col-span-3 font-semibold text-muted-foreground">
                Select Customer
              </p>
              <div className="whitespace-nowrap text-2xl col-span-8">
                <CustomerPicker setCustomer={setCustomer} userId={userId} />
              </div>

              {/* stock picker*/}
              <p className="whitespace-nowrap text-2xl col-span-3 font-semibold text-muted-foreground">
                Select Product
              </p>
              <div className="whitespace-nowrap text-2xl col-span-8">
                <StockPricker
                  setStockProduct={setStockProduct}
                  userId={userId}
                  supplierId={product?.supplierId as string}
                  product={product}
                />
              </div>

              {/* invoice number */}
              <p className="whitespace-nowrap text-2xl col-span-3 text-muted-foreground font-semibold">
                Invoice Number
              </p>
              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem className="whitespace-nowrap text-2xl col-span-8">
                    <FormControl>
                      <Input
                        {...field}
                        className="uppercase font-semibold text-2xl"
                      />
                    </FormControl>
                    <FormMessage className="dark:text-white" />
                  </FormItem>
                )}
              />

              {/* product number */}
              <p className="whitespace-nowrap text-2xl col-span-3 font-semibold text-muted-foreground">
                Product Number
              </p>
              <p className="whitespace-nowrap text-2xl col-span-8">
                {product?.productNumber}
              </p>

              {/* product description*/}
              <p className="whitespace-nowrap text-2xl col-span-3 font-semibold text-muted-foreground">
                Description
              </p>
              <p className="whitespace-nowrap text-2xl col-span-8">
                {product?.description}
              </p>

              {/* supplier */}
              <p className="whitespace-nowrap text-2xl col-span-3 font-semibold text-muted-foreground">
                Supplier
              </p>
              <p className="whitespace-nowrap text-2xl col-span-8">
                {product?.suppliers.name}
              </p>

              {/* sales person
              <p className="whitespace-nowrap text-2xl col-span-3 font-semibold">
                Sales Person
              </p>
              <p className="whitespace-nowrap text-2xl col-span-8">
                {product?.suppliers.salesPerson}
              </p> */}

              {/* selling price */}
              <p className="whitespace-nowrap text-2xl col-span-3 font-semibold text-muted-foreground">
                Selling Price
              </p>
              <FormField
                control={form.control}
                name="unitPrice"
                render={({ field }) => (
                  <FormItem className="whitespace-nowrap text-2xl col-span-8">
                    <FormControl>
                      <Input {...field} type="number" />
                    </FormControl>
                    <FormMessage className="dark:text-white" />
                  </FormItem>
                )}
              />

              {/* quantity */}
              <p className="whitespace-nowrap text-2xl col-span-3 font-semibold text-muted-foreground">
                Quantity
              </p>
              <div className="flex gap-2 w-full items-center col-span-8">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem className="whitespace-nowrap text-2xl col-span-8 w-fit">
                      <FormControl>
                        <Input {...field} type="number" />
                      </FormControl>
                      <FormMessage className="dark:text-white" />
                    </FormItem>
                  )}
                />
                <p className="uppercase font-semibold">
                  {product?.unitOfMeasurements.unit}
                </p>
              </div>

              {/* total price */}
              <p className="whitespace-nowrap text-2xl col-span-3 font-semibold text-muted-foreground">
                Total Price
              </p>
              <p className="whitespace-nowrap text-2xl col-span-8">
                {formatPrice(form.watch("quantity") * form.watch("unitPrice"))}
              </p>

              {/* date */}
              <p className="whitespace-nowrap text-2xl col-span-3 font-semibold text-muted-foreground">
                Date
              </p>
              <div className="whitespace-nowrap text-2xl col-span-8">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Popover
                        open={openCalendar}
                        onOpenChange={setOpenCalendar}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal dark:bg-slate-800",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            className="pointer-events-auto"
                            mode="single"
                            selected={field.value}
                            onSelect={(val) => {
                              field.onChange(val);
                              setOpenCalendar(false);
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="data:text-white" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center gap-4 mt-8 col-span-12">
                {/* sell product */}
                <Button
                  type="submit"
                  className="font-semibold"
                  disabled={!form.formState.isValid || isPending}
                >
                  Sell
                </Button>
                <Button
                  onClick={() =>
                    router.push(`/products?productId=${product?.id}`)
                  }
                  variant="secondary"
                  type="button"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>

      {/* stock */}
      {/* <div className="absolute top-5 right-10 rounded-lg bg-secondary">
        <div className="bg-primary/60 p-2 rounded-tl-lg rounded-tr-lg">
          <h3 className="font-bold">Stock Balance</h3>
        </div>
        <div className="p-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Number</TableHead>
                <TableHead>Stock BAL</TableHead>
                <TableHead>Purchased Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stocks?.map((stock, index) => (
                <TableRow key={index}>
                  <TableCell>{product?.productNumber}</TableCell>
                  <TableCell className="text-center">
                    {stock.quantity}
                  </TableCell>
                  <TableCell>{formatPrice(stock.unitPrice)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div> */}
    </Card>
  );
};
export default SellProduct;
