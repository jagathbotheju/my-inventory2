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
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn, formatPrice } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";
import { useCallback, useEffect, useState } from "react";
import CustomerPicker from "../CustomerPicker";
import { toast } from "sonner";
import { useProductStore } from "@/store/productStore";
import PaymentModePicker from "../PaymentModePicker";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import ProductsPickerDialog, {
  TableDataProductsPicker,
} from "../ProductsPickerDialog";
import { Customer } from "@/server/db/schema/customers";
import { useAddSellTxInvoice } from "@/server/backend/mutations/invoiceMutations";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface Props {
  userId: string;
}

export type SellProductsData = z.infer<typeof SellProductsSchema> & {
  userId: string;
  customerId: string;
  supplierId: string;
};

const SellProducts = ({ userId }: Props) => {
  const total: number[] = [];
  const router = useRouter();
  const [openCalInvoice, setOpenCalInvoice] = useState(false);
  const [paymentMode, setPaymentMode] = useState<string>("");
  const [customer, setCustomer] = useState<Customer>({} as Customer);
  const {
    selectedProducts,
    currentSupplier,
    removeSelectedProduct,
    removeSelectedProductId,
    setSelectedProducts,
    setSelectedProductIds,
  } = useProductStore();
  const { mutate, isPending } = useAddSellTxInvoice();

  const form = useForm<z.infer<typeof SellProductsSchema>>({
    resolver: zodResolver(SellProductsSchema),
    defaultValues: {
      date: new Date(),
      invoiceNumber: "",
      paymentMode: "",
      cacheAmount: 0,
      creditAmount: 0,
      products: [
        {
          unitPrice: 0,
          quantity: 0,
          purchasedPrice: 0,
          productNumber: "",
          productId: "",
        },
      ],
      cheques: [
        {
          chequeNumber: "",
          chequeDate: new Date(),
          bankName: "",
          amount: 0,
        },
      ],
    },
    mode: "all",
  });

  const { fields, append, remove } = useFieldArray({
    name: "products",
    control: form.control,
  });

  const {
    fields: checkFields,
    append: checkAppend,
    remove: checkRemove,
  } = useFieldArray({
    name: "cheques",
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

  const onSubmit = async (formData: z.infer<typeof SellProductsSchema>) => {
    if (!customer.id) return toast.error("Please select customer");
    const products = formData.products;
    if (!products.length) return;

    console.log("formData", formData);
    mutate({
      formData,
      userId,
      customerId: customer.id,
      date: formData.date.toDateString(),
    });
  };

  const removeSelected = (product: TableDataProductsPicker) => {
    removeSelectedProduct(product);
    removeSelectedProductId(product.selectedRowId as string);
  };

  const clearFields = () => {
    form.setValue("cacheAmount", 0);
    form.setValue("cheques", [
      {
        chequeNumber: "",
        chequeDate: new Date(),
        bankName: "",
        amount: 0,
      },
    ]);
  };

  useEffect(() => {
    if (selectedProducts?.length) {
      addFromFields();
    }
  }, [selectedProducts, addFromFields]);

  useEffect(() => {
    setSelectedProducts([]);
    setSelectedProductIds({});
  }, [setSelectedProducts, setSelectedProductIds]);

  if (!fields.length) return null;

  return (
    <Card className="dark:bg-transparent dark:border-primary/40 relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-4xl font-bold">Sell Products</CardTitle>

          {/* products picker */}
          <ProductsPickerDialog userId={userId} sellMode>
            <Button className="font-semibold">Select Products</Button>
          </ProductsPickerDialog>
        </div>
      </CardHeader>
      <CardContent>
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
              {/* customer picker */}
              <CustomerPicker
                setCustomer={setCustomer}
                userId={userId}
                supplierId={currentSupplier.id}
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
                <FormItem className="whitespace-nowrap text-2xl col-span-8 relative">
                  <FormControl>
                    <Input {...field} className="uppercase" />
                  </FormControl>
                  <FormMessage className="dark:text-white absolute -bottom-7" />
                </FormItem>
              )}
            />

            {/* selected products */}
            <div className="flex flex-col col-span-12 p-2">
              <Table>
                <TableHeader className="bg-secondary text-secondary-foreground">
                  <TableRow>
                    <TableHead>Product No.</TableHead>
                    <TableHead>Stock Bal.</TableHead>
                    <TableHead>Purchased Price</TableHead>
                    <TableHead>Sales Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {selectedProducts?.length
                    ? selectedProducts.map((product, index) => {
                        const fieldDynamic = fields[index];
                        form.setValue(
                          `products.${index}.productNumber`,
                          product.productNumber
                        );

                        if (product.purchasedPrice?.length === 1) {
                          form.setValue(
                            `products.${index}.purchasedPrice`,

                            product && product.purchasedPrice
                              ? Array.from(product?.purchasedPrice)[0]
                              : 0
                          );
                        }

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
                        if (total.length) {
                          form.setValue(
                            "creditAmount",
                            total?.reduce((acc, item) => acc + item)
                          );
                        }

                        return (
                          <TableRow key={fieldDynamic?.id ?? index}>
                            <TableCell className="uppercase">
                              {product.productNumber}
                            </TableCell>

                            {/* stock balance */}
                            <TableCell
                              className={`${
                                product &&
                                product.quantity &&
                                product?.quantity < 3 &&
                                "text-red-500 font-bold"
                              } `}
                            >
                              {product.quantity}
                            </TableCell>

                            {/* purchasedPrice - form*/}
                            <TableCell>
                              {product?.purchasedPrice &&
                              product?.purchasedPrice?.length > 1 ? (
                                <>
                                  <Select
                                    value={form

                                      .getValues(
                                        `products.${index}.purchasedPrice`
                                      )

                                      ?.toString()}
                                    onValueChange={(value) => {
                                      form.setValue(
                                        `products.${index}.purchasedPrice`,

                                        parseFloat(value)
                                      );
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="select price" />
                                    </SelectTrigger>

                                    <SelectContent>
                                      <SelectGroup>
                                        {product.purchasedPrice.map(
                                          (item, idx) => (
                                            <SelectItem
                                              key={idx}
                                              value={item.toString()}
                                            >
                                              {formatPrice(item)}
                                            </SelectItem>
                                          )
                                        )}
                                      </SelectGroup>
                                    </SelectContent>
                                  </Select>
                                </>
                              ) : (
                                <span>
                                  {formatPrice(
                                    product && product.purchasedPrice?.length
                                      ? product?.purchasedPrice[0]
                                      : 0
                                  )}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
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
                                      <FormMessage className="dark:text-white absolute -bottom-6 font-semibold" />
                                    </FormItem>
                                  );
                                }}
                              />
                            </TableCell>
                            <TableCell className="flex gap-2 w-full items-center relative my-4">
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
                              {/* {product?.quantity < sellQuantity && (
                                <span className="text-sm text-red-500 absolute font-semibold -bottom-3 left-3">
                                  no stocks
                                </span>
                              )} */}
                            </TableCell>
                            <TableCell>{formatPrice(totalPrice)}</TableCell>
                            <TableCell>
                              <Trash2Icon
                                className="text-red-500 w-5 h-5 cursor-pointer"
                                onClick={() => removeSelected(product)}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    : null}
                </TableBody>
              </Table>
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

            {/* payment mode */}
            <p className="whitespace-nowrap text-2xl col-span-3 font-semibold text-muted-foreground">
              Payment Mode
            </p>
            <div className="col-span-8">
              <FormField
                control={form.control}
                name="paymentMode"
                render={({ field }) => (
                  <FormItem className="whitespace-nowrap text-2xl relative">
                    <PaymentModePicker
                      value={field.value}
                      setValue={(value) => {
                        field.onChange(value);
                        setPaymentMode(value);
                      }}
                      clearFields={clearFields}
                    />
                    <FormMessage className="dark:text-white absolute -bottom-7" />
                  </FormItem>
                )}
              />
            </div>

            {paymentMode === "credit" && (
              <>
                {/* <div className="col-span-1" /> */}
                <div className="col-span-12 flex items-center gap-4 border border-1 rounded-md p-4">
                  <p className="whitespace-nowrap font-semibold text-muted-foreground ml-12">
                    Amount
                  </p>

                  {/* credit amount */}
                  <FormField
                    control={form.control}
                    name="creditAmount"
                    render={({ field }) => (
                      <FormItem className="whitespace-nowrap text-2xl relative">
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter cash amount"
                            className="text-2xl font-semibold"
                          />
                        </FormControl>
                        <FormMessage className="dark:text-white absolute -bottom-7" />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {paymentMode === "cash" && (
              <>
                {/* <div className="col-span-1" /> */}
                <div className="col-span-12 flex items-center gap-4 border border-1 rounded-md p-4">
                  <p className="whitespace-nowrap font-semibold text-muted-foreground ml-12">
                    Amount
                  </p>

                  {/* cache amount */}
                  <FormField
                    control={form.control}
                    name="cacheAmount"
                    render={({ field }) => (
                      <FormItem className="whitespace-nowrap text-2xl relative">
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter cash amount"
                            className="text-2xl font-semibold"
                          />
                        </FormControl>
                        <FormMessage className="dark:text-white absolute -bottom-7" />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {paymentMode === "cheque" && (
              <>
                <div className="col-span-12 border border-1 rounded-md p-6">
                  <div className="flex flex-col gap-6 ml-12 justify-center w-full">
                    {checkFields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-5">
                        {/* cheque number */}
                        <FormField
                          control={form.control}
                          name={`cheques.${index}.chequeNumber`}
                          render={({ field }) => (
                            <FormItem className="whitespace-nowrap text-2xl col-span-2 relative my-1">
                              <FormLabel className="absolute -top-3">
                                cheque number
                              </FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage className="dark:text-white absolute -bottom-7" />
                            </FormItem>
                          )}
                        />

                        {/* bank name */}
                        <FormField
                          control={form.control}
                          name={`cheques.${index}.bankName`}
                          render={({ field }) => (
                            <FormItem className="whitespace-nowrap text-2xl col-span-2 relative my-1">
                              <FormLabel className="absolute -top-3">
                                bank name
                              </FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage className="dark:text-white absolute -bottom-7" />
                            </FormItem>
                          )}
                        />

                        {/* amount */}
                        <FormField
                          control={form.control}
                          name={`cheques.${index}.amount`}
                          render={({ field }) => (
                            <FormItem className="whitespace-nowrap text-2xl col-span-2 relative my-1">
                              <FormLabel className="absolute -top-3">
                                amount
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  placeholder="Amount"
                                />
                              </FormControl>
                              <FormMessage className="dark:text-white absolute -bottom-7" />
                            </FormItem>
                          )}
                        />

                        {/* date */}
                        <FormField
                          control={form.control}
                          name={`cheques.${index}.chequeDate`}
                          render={({ field }) => (
                            <FormItem className="whitespace-nowrap text-2xl col-span-2 relative my-1">
                              <FormLabel className="absolute -top-3">
                                date
                              </FormLabel>
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
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    className="pointer-events-auto"
                                    mode="single"
                                    selected={field.value}
                                    onSelect={(val) => {
                                      field.onChange(val);
                                    }}
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage className="dark:text-white absolute -bottom-7" />
                            </FormItem>
                          )}
                        />

                        {/* delete cheque */}
                        {checkFields.length > 1 && (
                          <Trash2Icon
                            onClick={() => checkRemove(index)}
                            className="text-red-500 w-5 h-5 cursor-pointer col-span-2 -mb-1"
                          />
                        )}

                        {/* add cheque */}
                        <Button
                          type="button"
                          className="w-fit font-semibold col-span-2 -mb-2"
                          onClick={() =>
                            checkAppend({
                              chequeNumber: "",
                              bankName: "",
                              amount: 0,
                              chequeDate: new Date(),
                            })
                          }
                        >
                          New
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {paymentMode === "cash-cheque" && (
              <div className="col-span-12 border border-1 rounded-md p-6">
                {/* cache */}
                <div className="col-span-12 flex items-center gap-4 ml-12">
                  <p className="whitespace-nowrap font-semibold text-muted-foreground">
                    Cache Amount
                  </p>

                  {/* cache amount */}
                  <FormField
                    control={form.control}
                    name="cacheAmount"
                    render={({ field }) => (
                      <FormItem className="whitespace-nowrap text-2xl relative">
                        <FormControl>
                          <Input {...field} placeholder="Enter cash amount" />
                        </FormControl>
                        <FormMessage className="dark:text-white absolute -bottom-7" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* cheque */}
                <div className="flex flex-col gap-6 ml-12 col-span-12 mt-8">
                  {checkFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-5">
                      {/* cheque number */}
                      <FormField
                        control={form.control}
                        name={`cheques.${index}.chequeNumber`}
                        render={({ field }) => (
                          <FormItem className="whitespace-nowrap text-2xl col-span-2 relative my-1">
                            <FormLabel className="absolute -top-3">
                              cheque number
                            </FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage className="dark:text-white absolute -bottom-7" />
                          </FormItem>
                        )}
                      />

                      {/* bank name */}
                      <FormField
                        control={form.control}
                        name={`cheques.${index}.bankName`}
                        render={({ field }) => (
                          <FormItem className="whitespace-nowrap text-2xl col-span-2 relative my-1">
                            <FormLabel className="absolute -top-3">
                              bank name
                            </FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage className="dark:text-white absolute -bottom-7" />
                          </FormItem>
                        )}
                      />

                      {/* amount */}
                      <FormField
                        control={form.control}
                        name={`cheques.${index}.amount`}
                        render={({ field }) => (
                          <FormItem className="whitespace-nowrap text-2xl col-span-2 relative my-1">
                            <FormLabel className="absolute -top-3">
                              amount
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                placeholder="Amount"
                              />
                            </FormControl>
                            <FormMessage className="dark:text-white absolute -bottom-7" />
                          </FormItem>
                        )}
                      />

                      {/* date */}
                      <FormField
                        control={form.control}
                        name={`cheques.${index}.chequeDate`}
                        render={({ field }) => (
                          <FormItem className="whitespace-nowrap text-2xl col-span-2 relative my-1">
                            <FormLabel className="absolute -top-3">
                              date
                            </FormLabel>
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
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  className="pointer-events-auto"
                                  mode="single"
                                  selected={field.value}
                                  onSelect={(val) => {
                                    field.onChange(val);
                                  }}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage className="dark:text-white absolute -bottom-7" />
                          </FormItem>
                        )}
                      />

                      {/* delete cheque */}
                      {checkFields.length > 1 && (
                        <Trash2Icon
                          onClick={() => checkRemove(index)}
                          className="text-red-500 w-5 h-5 cursor-pointer col-span-1"
                        />
                      )}

                      {/* add cheque */}
                      <Button
                        type="button"
                        className="w-fit font-semibold"
                        onClick={() =>
                          checkAppend({
                            chequeNumber: "",
                            bankName: "",
                            amount: 0,
                            chequeDate: new Date(),
                          })
                        }
                      >
                        New
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* date */}
            <p className="whitespace-nowrap text-2xl col-span-3 font-semibold text-muted-foreground mt-4">
              Date
            </p>
            <div className="whitespace-nowrap text-2xl col-span-8 mt-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <Popover
                      open={openCalInvoice}
                      onOpenChange={setOpenCalInvoice}
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
                            setOpenCalInvoice(false);
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
                // disabled={!form.formState.isValid || isPending}
              >
                {isPending && <Loader2Icon className="mr-2 animate-spin" />}
                {isPending ? "Selling Products..." : "Sell Products"}
              </Button>
              <Button
                onClick={() =>
                  // router.push(`/products?productId=${product?.id}`)
                  router.back()
                }
                variant="secondary"
                type="button"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
export default SellProducts;
