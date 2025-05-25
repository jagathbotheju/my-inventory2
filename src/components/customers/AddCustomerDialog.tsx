"use client";

import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { z } from "zod";
import { NewCustomerSchema } from "@/lib/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { HouseIcon, PhoneIcon, UserRoundIcon } from "lucide-react";
import { FaMobileScreen } from "react-icons/fa6";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { useAddCustomer } from "@/server/backend/mutations/customerMutations";
import { useCustomerById } from "@/server/backend/queries/customerQueries";

interface Props {
  children: React.ReactNode;
  customerId?: string;
  userId: string;
}

const AddCustomerDialog = ({ children, customerId, userId }: Props) => {
  const [open, setOpen] = useState(false);

  const { mutate: addCustomer } = useAddCustomer();
  const { data: customer } = useCustomerById(customerId ?? "");

  const form = useForm<z.infer<typeof NewCustomerSchema>>({
    resolver: zodResolver(NewCustomerSchema),
    defaultValues: {
      name: customer ? customer[0]?.name : "",
      address: (customer && customer[0]?.address) ?? "",
      landPhone: (customer && customer[0]?.landPhone) ?? "",
      mobilePhone: (customer && customer[0]?.mobilePhone) ?? "",
    },
    mode: "all",
  });

  const onSubmit = (formData: z.infer<typeof NewCustomerSchema>) => {
    addCustomer({ formData, customerId, userId });
    form.reset();
  };

  useEffect(() => {
    form.reset();
    if (customerId && customer) {
      form.setValue("name", customer[0]?.name);
      form.setValue("address", customer[0].address ?? "");
      form.setValue("landPhone", customer[0].landPhone ?? "");
      form.setValue("mobilePhone", customer[0].mobilePhone ?? "");
    }
  }, [form, customer, customerId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Register New Customer</DialogTitle>
          <DialogDescription className="hidden">
            Register new Customer
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => {
                  console.log("field cus", field);
                  return (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <div className="flex relative">
                          <UserRoundIcon className="absolute top-1 bottom-1 left-1 text-primary" />
                          <Input {...field} className="pl-9" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              {/* address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <div className="flex relative">
                        <HouseIcon className="absolute top-1 bottom-1 left-1 text-primary" />
                        <Input {...field} className="pl-9" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* land phone */}
              <FormField
                control={form.control}
                name="landPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Office Phone</FormLabel>
                    <FormControl>
                      <div className="flex relative">
                        <PhoneIcon className="absolute top-1 bottom-1 left-1 text-primary" />
                        <Input {...field} className="pl-9" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* mobile phone */}
              <FormField
                control={form.control}
                name="mobilePhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Phone</FormLabel>
                    <FormControl>
                      <div className="flex relative">
                        <FaMobileScreen className="absolute top-1 bottom-1 left-1 text-primary w-6 h-6" />
                        <Input {...field} className="pl-9" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="sm:justify-start">
                <div className="flex gap-2">
                  <Button
                    {...(form.formState.isValid
                      ? { onClick: () => setOpen(false) }
                      : {})}
                    type="submit"
                  >
                    Register
                  </Button>
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="secondary"
                      // onClick={() => form.reset()}
                    >
                      Close
                    </Button>
                  </DialogClose>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default AddCustomerDialog;
