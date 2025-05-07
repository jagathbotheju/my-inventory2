"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CalendarIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { SellProductsSchema } from "@/lib/schema";
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
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn, formatPrice } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";
import { useAddSellTransactions } from "@/server/backend/mutations/sellTxMutations";
import { SellTransaction } from "@/server/db/schema/sellTransactions";
import { Customer } from "@/server/db/schema/customers";
import { useCallback, useEffect, useState } from "react";
import CustomerPicker from "../CustomerPicker";
import { toast } from "sonner";
import ProductsPickerDialog, { TableData } from "../ProductsPickerDialog";
import { useProductStore } from "@/store/productStore";

interface Props {
  userId: string;
}

export type SellProductsData = z.infer<typeof SellProductsSchema> & {
  userId: string;
  customerId: string;
  supplierId: string;
};

const SellProducts = ({ userId }: Props) => {
  // const router = useRouter();
  const total: number[] = [];
  const [customer, setCustomer] = useState<Customer>({} as Customer);
  // const [stockProduct, setStockProduct] = useState<Stock>({} as Stock);
  const mutate = useAddSellTransactions();
  // const [products, setProducts] = useState<SelectedProduct[]>([]);
  const {
    selectedProducts,
    currentSupplier,
    removeSelectedProduct,
    removeSelectedProductId,
  } = useProductStore();
  const isLoading = false;

  const form = useForm<z.infer<typeof SellProductsSchema>>({
    resolver: zodResolver(SellProductsSchema),
    defaultValues: {
      date: new Date(),
      invoiceNumber: "",
      products: [
        {
          unitPrice: 0,
          quantity: 0,
          purchasedPrice: 0,
          productNumber: "",
          productId: "",
        },
      ],
    },
    mode: "all",
  });

  const { fields, append, remove } = useFieldArray({
    name: "products",
    control: form.control,
  });

  const addFromFields = useCallback(() => {
    remove();
    selectedProducts.map(() => {
      append({
        unitPrice: 0,
        quantity: 0,
      });
    });
  }, [append, selectedProducts, remove]);

  // console.log("selectedProducts", selectedProducts);

  const onSubmit = async (formData: z.infer<typeof SellProductsSchema>) => {
    if (!customer.id) return toast.error("Please select customer");
    const products = formData.products;
    if (!products.length) return;

    const allMutations = products.map((item) => {
      const data = {
        productId: item.productId as string,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        purchasedPrice: item.purchasedPrice ?? 0,
        userId,
        customerId: customer.id,
        supplierId: currentSupplier.id,
        date: formData.date.toDateString(),
        invoiceNumber: formData.invoiceNumber,
      } as SellTransaction;
      return mutate.mutateAsync(data);
    });

    try {
      await Promise.all(allMutations);
    } catch (error) {
      console.log(error);
      toast.error("Could not add Sell Transactions");
    }
  };

  const removeSelected = (product: TableData) => {
    removeSelectedProduct(product.productId);
    removeSelectedProductId(product.selectedRowId as string);
  };

  useEffect(() => {
    if (selectedProducts?.length) {
      addFromFields();
    }
  }, [selectedProducts, addFromFields]);

  // console.log("formFields", fields);
  if (!fields.length) return null;

  return (
    <Card className="dark:bg-transparent dark:border-primary/40 relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-4xl font-bold">Sell Products</CardTitle>
          <ProductsPickerDialog userId={userId}>
            <Button className="font-semibold">Select Products</Button>
          </ProductsPickerDialog>
        </div>
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
              {/* supplier */}
              <p className="whitespace-nowrap text-2xl col-span-3 font-semibold text-muted-foreground">
                Supplier
              </p>
              <div className="whitespace-nowrap text-2xl col-span-8 font-semibold">
                {currentSupplier?.name}
              </div>

              {/* customers */}
              <p className="whitespace-nowrap text-2xl col-span-3 font-semibold text-muted-foreground">
                Select Customer
              </p>
              <div className="whitespace-nowrap text-2xl col-span-8">
                <CustomerPicker setCustomer={setCustomer} userId={userId} />
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

              {/* selected products */}
              <div className="flex flex-col col-span-12 p-2">
                <div className="grid grid-cols-12 gap-4 bg-secondary p-2 rounded-md font-semibold text-secondary-foreground">
                  <p className="col-span-3">Product No.</p>
                  <p className="col-span-1">Stock Bal.</p>
                  <p className="col-span-2">Purchased Price</p>
                  <p className="col-span-2">Sales Price</p>
                  <p className="col-span-1">Quantity</p>
                  <p className="col-span-1">Total</p>
                  <p className="col-span-1"></p>
                </div>

                <div className="mt-2">
                  {selectedProducts?.length ? (
                    selectedProducts.map((product, index) => {
                      const fieldDynamic = fields[index];
                      form.setValue(
                        `products.${index}.productNumber`,
                        product.productNumber
                      );
                      form.setValue(
                        `products.${index}.purchasedPrice`,
                        product.purchasedPrice
                      );
                      form.setValue(
                        `products.${index}.productId`,
                        product.productId
                      );
                      const sellQuantity = form.watch(
                        `products.${index}.quantity`
                      );
                      const sellUnitPrice = form.watch(
                        `products.${index}.unitPrice`
                      );
                      const totalPrice = sellQuantity * sellUnitPrice;

                      if (totalPrice) total.push(totalPrice);

                      return (
                        <div
                          key={fieldDynamic?.id ?? index}
                          className="grid grid-cols-12 gap-4 p-2 hover:bg-secondary/60 items-center w-full"
                        >
                          {/* 3-cols - productNumber */}
                          <p className="col-span-3 uppercase">
                            {product.productNumber}
                          </p>

                          {/* 1-cols - stockBal */}
                          <p className="coi-span-1">{product.quantity}</p>

                          {/* 2-cols - purchasedPrice */}
                          <p className="col-span-2 w-fit">
                            {formatPrice(product.purchasedPrice)}
                          </p>

                          {/* 2-cols - salesPrice */}
                          <div className="col-span-2">
                            <FormField
                              key={index}
                              control={form.control}
                              name={`products.${index}.unitPrice` as const}
                              render={(field) => {
                                return (
                                  <FormItem className="whitespace-nowrap text-xl relative">
                                    <FormControl>
                                      <Input {...field.field} type="number" />
                                    </FormControl>
                                    <FormMessage className="dark:text-white absolute -bottom-6" />
                                  </FormItem>
                                );
                              }}
                            />
                          </div>

                          {/* 1-cols - quantity */}
                          <div className="col-span-1 flex gap-2 w-full items-center">
                            <FormField
                              key={index + 1}
                              control={form.control}
                              name={`products.${index}.quantity` as const}
                              render={(field) => (
                                <FormItem className="whitespace-nowrap text-xl w-fit relative">
                                  <FormControl>
                                    <Input {...field.field} type="number" />
                                  </FormControl>
                                  <FormMessage className="dark:text-white absolute -bottom-6" />
                                </FormItem>
                              )}
                            />
                            {/* <p className="uppercase font-semibold">
                              {product.unit}
                            </p> */}
                          </div>

                          {/* 2-cols - total */}
                          <p className="col-span-2">
                            {formatPrice(totalPrice)}
                          </p>

                          {/* 1-cols - delete */}
                          <Trash2Icon
                            className="text-red-500 w-5 h-5 cursor-pointer col-span-1"
                            onClick={() => removeSelected(product)}
                          />
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-muted-foreground mt-4 font-semibold">
                      No products selected
                    </div>
                  )}
                </div>
              </div>

              {/* total price */}
              <p className="whitespace-nowrap text-2xl col-span-3 font-semibold text-muted-foreground">
                Total Price
              </p>
              <p className="whitespace-nowrap text-2xl col-span-8">
                {total.length
                  ? formatPrice(total.reduce((acc, item) => acc + item))
                  : 0}
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
                {/* sell product */}
                <Button
                  type="submit"
                  className="font-semibold"
                  // disabled={!form.formState.isValid || isPending}
                >
                  Sell
                </Button>
                <Button
                  // onClick={() =>
                  //   router.push(`/products?productId=${product?.id}`)
                  // }
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
export default SellProducts;
