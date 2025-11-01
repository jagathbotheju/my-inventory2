"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CalendarIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { BuyProductsSchema } from "@/lib/schema";
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
import ProductsPickerDialog, {
  TableDataProductsPicker,
} from "../ProductsPickerDialog";
import { useProductStore } from "@/store/productStore";
import PaymentModePicker from "../PaymentModePicker";
import { useRouter } from "next/navigation";
import SupplierPicker from "../SupplierPicker";
import { Supplier } from "@/server/db/schema/suppliers";
import { useAddByTxInvoice } from "@/server/backend/mutations/invoiceMutations";

interface Props {
  userId: string;
}

const BuyProducts = ({ userId }: Props) => {
  const router = useRouter();
  const total: number[] = [];
  const [openCalInvoice, setOpenCalInvoice] = useState(false);
  const [paymentMode, setPaymentMode] = useState<string>("");
  const [supplier, setSupplier] = useState<Supplier>({} as Supplier);
  const {
    selectedProducts,
    currentSupplier,
    removeSelectedProduct,
    removeSelectedProductId,
    setSelectedProducts,
    setSelectedProductIds,
  } = useProductStore();
  const { mutate: addBuyTxInvoice, isPending } = useAddByTxInvoice();

  const form = useForm<z.infer<typeof BuyProductsSchema>>({
    resolver: zodResolver(BuyProductsSchema),
    defaultValues: {
      date: new Date(), //ok
      invoiceNumber: "", //ok
      paymentMode: "",
      cacheAmount: 0,
      creditAmount: 0,
      products: [
        {
          unitPrice: 0, //ok
          quantity: 0, //ok
          productNumber: "", //ok
          productId: "", //ok
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

  const removeSelected = (product: TableDataProductsPicker) => {
    removeSelectedProduct(product);
    removeSelectedProductId(product.selectedRowId as string);
  };

  const clearFields = () => {
    form.setValue("creditAmount", 0);
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

  const onSubmit = async (formData: z.infer<typeof BuyProductsSchema>) => {
    const products = formData.products;
    if (!products.length) return;
    console.log("date", formData.date);
    console.log("date string", formData.date.toDateString());

    addBuyTxInvoice({
      userId,
      formData,
      supplierId: currentSupplier.id,
      date: formData.date.toDateString(),
    });
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
          <CardTitle className="text-4xl font-bold">Buying Products</CardTitle>

          {/* products picker */}
          <ProductsPickerDialog userId={userId} sellMode={false}>
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
            {/* supplier picker*/}
            <p className="whitespace-nowrap text-2xl col-span-3 font-semibold text-muted-foreground">
              Select Supplier
            </p>
            <div className="whitespace-nowrap text-2xl col-span-8 w-fit">
              <SupplierPicker
                setSupplier={setSupplier}
                userId={userId}
                supplierId={supplier.id ? supplier.id : currentSupplier.id}
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
              <div className="grid grid-cols-12 gap-4 bg-secondary p-2 rounded-md font-semibold text-secondary-foreground">
                <p className="col-span-3">Product No.</p>
                <p className="col-span-2">Stock Bal.</p>
                <p className="col-span-2">Purchase Price</p>
                <p className="col-span-2">Quantity</p>
                <p className="col-span-2">Total</p>
                <p className="col-span-1"></p>
              </div>

              <div className="mt-2 col-span-12">
                {selectedProducts?.length ? (
                  selectedProducts.map((product, index) => {
                    const fieldDynamic = fields[index];
                    form.setValue(
                      `products.${index}.productNumber`,
                      product.productNumber
                    );

                    form.setValue(
                      `products.${index}.productId`,
                      product.productId
                    );
                    const buyQuantity = form.watch(
                      `products.${index}.quantity`
                    );
                    const buyUnitPrice = form.watch(
                      `products.${index}.unitPrice`
                    );
                    const totalPrice = buyQuantity * buyUnitPrice;

                    if (totalPrice) total.push(totalPrice);
                    if (total.length && paymentMode === "credit") {
                      form.setValue(
                        "creditAmount",
                        total?.reduce((acc, item) => acc + item)
                      );
                    }

                    return (
                      <div
                        key={fieldDynamic?.id ?? index}
                        className="grid grid-cols-12 gap-4 p-2 hover:bg-secondary/60"
                      >
                        {/* 3-cols - productNumber */}
                        <p className="col-span-3 uppercase self-center">
                          {product.productNumber}
                        </p>

                        {/* 2-cols - stockBal */}
                        <p
                          className={cn(
                            "col-span-2 self-center",
                            `${
                              product &&
                              product.quantity &&
                              product?.quantity < 3 &&
                              "text-red-500 font-bold"
                            } `
                          )}
                        >
                          {product.quantity ?? 0}
                        </p>

                        {/* 2-cols - purchasePrice */}
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

                        {/* 2-cols - quantity */}
                        <div className="col-span-2 flex gap-2 w-full items-center relative">
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
                        </div>

                        {/* 2-cols - total */}
                        <p className="col-span-2 self-center">
                          {formatPrice(totalPrice)}
                        </p>

                        {/* 1-cols - delete */}
                        <Trash2Icon
                          className="text-red-500 w-5 h-5 cursor-pointer col-span-1 self-center"
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
                        clearFields();
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
                            placeholder="Enter credit amount"
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
                <div className="col-span-12 border border-1 rounded-md p-6 flex gap-8 flex-col">
                  {checkFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-center gap-6 my-1"
                    >
                      {/* cheque number */}
                      <FormField
                        control={form.control}
                        name={`cheques.${index}.chequeNumber`}
                        render={({ field }) => (
                          <FormItem className="text-2xl relative">
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
                          <FormItem className="text-2xl relative">
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
                          <FormItem className="text-2xl relative">
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
                          <FormItem className="text-2xl relative">
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

                      {/* add cheque */}
                      <Button
                        type="button"
                        size="sm"
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

                      {/* delete cheque */}
                      {checkFields.length > 1 && (
                        <Trash2Icon
                          onClick={() => checkRemove(index)}
                          className="text-red-500 w-5 h-5 cursor-pointer"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {paymentMode === "cash-cheque" && (
              <div className="col-span-12 border border-1 rounded-md p-6 flex gap-8 flex-col">
                {/* cache */}
                <div className="col-span-12 flex items-center gap-4 mb-6">
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
                {checkFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-6 my-1">
                    {/* cheque number */}
                    <FormField
                      control={form.control}
                      name={`cheques.${index}.chequeNumber`}
                      render={({ field }) => (
                        <FormItem className="text-2xl relative">
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
                        <FormItem className="text-2xl relative">
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
                        <FormItem className="text-2xl relative">
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
                        <FormItem className="text-2xl relative">
                          <FormLabel className="absolute -top-3">
                            Date of birth
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-[240px] pl-3 text-left font-normal",
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
                                mode="single"
                                selected={field.value}
                                captionLayout="dropdown"
                                onSelect={(val) => {
                                  field.onChange(val);
                                }}
                              />
                            </PopoverContent>
                          </Popover>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* add cheque */}
                    <Button
                      type="button"
                      size="sm"
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

                    {/* delete cheque */}
                    {checkFields.length > 1 && (
                      <Trash2Icon
                        onClick={() => checkRemove(index)}
                        className="text-red-500 w-5 h-5 cursor-pointer"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* invoice date */}
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
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="data:text-white" />
                  </FormItem>
                )}
              />
            </div>

            {/* form actions */}
            <div className="flex items-center gap-4 mt-8 col-span-12">
              {/* sell product */}
              <Button
                type="submit"
                className="font-semibold"
                // disabled={!form.formState.isValid || isPending}
              >
                {isPending && <Loader2Icon className="mr-2 animate-spin" />}
                {isPending ? "Buying Products..." : "Buy Products"}
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
export default BuyProducts;
