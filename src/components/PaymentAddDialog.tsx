"use client";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import PaymentModePicker from "./PaymentModePicker";
import { Input } from "./ui/input";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Trash2Icon } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { AddTxPaymentSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { useAddPayment } from "@/server/backend/mutations/invoiceMutations";

// import { useAddPayment } from "@/server/backend/mutations/invoiceMutations";

interface Props {
  children: React.ReactNode;
  invoiceNumber: string;
  invoiceId: string;
}

const PaymentAddDialog = ({ children, invoiceNumber, invoiceId }: Props) => {
  const [paymentMode, setPaymentMode] = useState<string>("");
  // const [cashAmount, setCashAmount] = useState(0);

  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof AddTxPaymentSchema>>({
    resolver: zodResolver(AddTxPaymentSchema),
    defaultValues: {
      paymentMode: "",
      cashAmount: 0,
      creditAmount: 0,
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

  const {
    fields: checkFields,
    append: checkAppend,
    remove: checkRemove,
  } = useFieldArray({
    name: "cheques",
    control: form.control,
  });

  const { mutate: addPayment } = useAddPayment();

  const clearFields = () => {
    form.setValue("cashAmount", 0);
    form.setValue("creditAmount", 0);
    form.setValue("cheques", [
      {
        chequeNumber: "",
        chequeDate: new Date(),
        bankName: "",
        amount: 0,
      },
    ]);
  };

  const checkPaymentErrors = (formData: z.infer<typeof AddTxPaymentSchema>) => {
    if (paymentMode === "cash" && formData.cashAmount === 0) {
      form.setError("cashAmount", { message: "cash amount required" });
      return true;
    }
    if (paymentMode === "credit" && formData.creditAmount === 0) {
      form.setError("creditAmount", { message: "credit amount required" });
      return true;
    }

    if (
      paymentMode === "cheque" &&
      formData.cheques &&
      formData?.cheques.length
    ) {
      let chequeErrors = false;
      formData.cheques.map((item, index) => {
        if (!item.chequeNumber) {
          console.log("error set checkNumber");
          form.setError(`cheques.${index}.chequeNumber`, {
            message: "cheque number required",
          });
          chequeErrors = true;
        }
        if (!item.bankName) {
          console.log("error set bankName");
          form.setError(`cheques.${index}.bankName`, {
            message: "bank name required",
          });
          chequeErrors = true;
        }
        if (item.amount === 0 || !item.amount) {
          form.setError(`cheques.${index}.amount`, {
            message: "amount required",
          });
          chequeErrors = true;
        }
      });
      return chequeErrors;
    }
    return false;
  };

  const onSubmit = async (formData: z.infer<typeof AddTxPaymentSchema>) => {
    if (!checkPaymentErrors(formData)) {
      const data = {
        invoiceId,
        paymentMode,
        cashAmount: formData.cashAmount ?? 0,
        creditAmount: formData.creditAmount ?? 0,
        chequeData: formData.cheques,
      };
      console.log("formData", formData);
      addPayment(data);
      setOpen(false);
    }
  };

  useEffect(() => {
    if (open) {
      setPaymentMode("");
      form.setValue("paymentMode", "");
      form.setValue("cashAmount", 0);
      form.setValue("creditAmount", 0);
      form.setValue("cheques", [
        {
          chequeNumber: "",
          chequeDate: new Date(),
          bankName: "",
          amount: 0,
        },
      ]);
    }
  }, [form, open]);

  // console.log("errors", _.isEmpty(form.formState.errors));

  return (
    <Dialog open={open} onOpenChange={setOpen} modal>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[70%]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex justify-between items-center border border-b-primary border-t-transparent border-l-transparent border-r-transparent p-2">
              <p>Add Payment</p>
              <p className="uppercase">{invoiceNumber}</p>
            </div>
          </DialogTitle>
          <DialogDescription className="hidden">
            View the payment history for your account.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-2">
              {/* payment mode */}
              <div className="grid grid-cols-6 items-center">
                <p className="font-semibold text-muted-foreground col-span-2">
                  Select Payment Mode
                </p>
                <div className="col-span-4">
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
              </div>

              {/* credit */}
              {paymentMode === "credit" && (
                <div className="col-span-12 flex items-center gap-4 border border-1 rounded-md p-8">
                  <p className="whitespace-nowrap font-semibold text-muted-foreground ml-12">
                    Credit Amount
                  </p>
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
              )}

              {/* cash */}
              {paymentMode === "cash" && (
                <div className="col-span-12 flex items-center gap-4 border border-1 rounded-md p-8">
                  <p className="whitespace-nowrap font-semibold text-muted-foreground ml-12">
                    Cash Amount
                  </p>
                  <FormField
                    control={form.control}
                    name="cashAmount"
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
              )}

              {/* cheque */}
              {paymentMode === "cheque" && (
                <div className="col-span-12 border border-1 rounded-md p-6">
                  <div className="flex flex-col gap-6 justify-center w-full">
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
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
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
                      name="cashAmount"
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
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
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
            </div>
            <DialogFooter className="mt-6">
              <Button type="submit">Add</Button>
              <DialogClose asChild>
                <Button className="" variant="outline">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentAddDialog;
