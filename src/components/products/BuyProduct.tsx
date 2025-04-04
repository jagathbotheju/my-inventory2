"use client";

import { useProductById } from "@/server/backend/queries/productQueries";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CalendarIcon, Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BuyProductSchema } from "@/lib/schema";
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
import { BuyTransaction } from "@/server/db/schema/buyTransactions";
import { useAddBuyTransaction } from "@/server/backend/mutations/buyTxMutations";

interface Props {
  productId: string;
  userId: string;
}

const BuyProduct = ({ productId, userId }: Props) => {
  const router = useRouter();
  const { data: product, isLoading } = useProductById({ productId, userId });
  const { mutate: addBuyTransaction, isPending } = useAddBuyTransaction();

  const form = useForm<z.infer<typeof BuyProductSchema>>({
    resolver: zodResolver(BuyProductSchema),
    defaultValues: {
      unitPrice: 0,
      quantity: 0,
      date: new Date(),
    },
    mode: "all",
  });

  const onSubmit = (formData: z.infer<typeof BuyProductSchema>) => {
    const data = {
      userId,
      supplierId: product?.suppliers.id as string,
      productId,
      productNumber: product?.productNumber as string,
      date: formData.date.toDateString(),
      unitPrice: formData.unitPrice,
      quantity: formData.quantity,
    } as BuyTransaction;
    addBuyTransaction(data);
  };

  return (
    <Card className="dark:bg-transparent dark:border-primary/40">
      <CardHeader>
        <CardTitle className="text-4xl font-bold">Buy Products</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex w-full justify-center items-center">
            <Loader2Icon className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-12 gap-4"
            >
              {/* product number */}
              <p className="whitespace-nowrap text-2xl col-span-3 font-semibold">
                Product Number
              </p>
              <p className="whitespace-nowrap text-2xl col-span-8">
                {product?.productNumber}
              </p>

              {/* product number */}
              <p className="whitespace-nowrap text-2xl col-span-3 font-semibold">
                Description
              </p>
              <p className="whitespace-nowrap text-2xl col-span-8">
                {product?.description}
              </p>

              {/* supplier */}
              <p className="whitespace-nowrap text-2xl col-span-3 font-semibold">
                Supplier
              </p>
              <p className="whitespace-nowrap text-2xl col-span-8">
                {product?.suppliers.name}
              </p>

              {/* sales person */}
              <p className="whitespace-nowrap text-2xl col-span-3 font-semibold">
                Sales Person
              </p>
              <p className="whitespace-nowrap text-2xl col-span-8">
                {product?.suppliers.salesPerson}
              </p>

              {/* unit price */}
              <p className="whitespace-nowrap text-2xl col-span-3 font-semibold">
                Unit Price
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
              <p className="whitespace-nowrap text-2xl col-span-3 font-semibold">
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
              <p className="whitespace-nowrap text-2xl col-span-3 font-semibold">
                Total Price
              </p>
              <p className="whitespace-nowrap text-2xl col-span-8">
                {formatPrice(form.watch("quantity") * form.watch("unitPrice"))}
              </p>

              {/* date */}
              <p className="whitespace-nowrap text-2xl col-span-3 font-semibold">
                Date
              </p>
              <div className="whitespace-nowrap text-2xl col-span-8">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Popover>
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
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            // disabled={(date) =>
                            //   date > new Date() || date < new Date("1900-01-01")
                            // }
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
                {/* add transaction */}
                <Button
                  type="submit"
                  className="font-semibold"
                  disabled={!form.formState.isValid || isPending}
                >
                  Buy
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
    </Card>
  );
};
export default BuyProduct;
