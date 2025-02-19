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
import { NewSupplierSchema } from "@/lib/schema";
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
import { FactoryIcon, PhoneIcon, UserRoundIcon } from "lucide-react";
import { FaMobileScreen } from "react-icons/fa6";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { useAddSupplier } from "@/server/backend/mutations/supplierMutations";
import { useSupplierById } from "@/server/backend/queries/supplierQueries";

interface Props {
  children: React.ReactNode;
  userId: string;
  supplierId?: string;
  editMode?: boolean;
}

const AddSupplierDialog = ({
  children,
  supplierId,
  userId,
  editMode = false,
}: Props) => {
  const [open, setOpen] = useState(false);
  // const [edit, setEdit] = useState(true);

  const { mutate: addSupplier } = useAddSupplier();
  const { data: supplier } = useSupplierById({
    supplierId: supplierId as string,
    userId,
  });

  const form = useForm<z.infer<typeof NewSupplierSchema>>({
    resolver: zodResolver(NewSupplierSchema),
    defaultValues: {
      name: supplier ? supplier[0]?.name : "",
      salesPerson: (supplier && supplier[0]?.salesPerson) ?? "",
      landPhone: (supplier && supplier[0]?.landPhone) ?? "",
      mobilePhone: (supplier && supplier[0]?.mobilePhone) ?? "",
    },
    mode: "all",
  });

  const onSubmit = (formData: z.infer<typeof NewSupplierSchema>) => {
    addSupplier({ formData, supplierId, userId });
    form.reset();
  };

  useEffect(() => {
    form.reset();
    if (supplierId && supplier) {
      form.setValue("name", supplier[0]?.name);
      form.setValue("salesPerson", supplier[0].salesPerson ?? "");
      form.setValue("landPhone", supplier[0].landPhone ?? "");
      form.setValue("mobilePhone", supplier[0].mobilePhone ?? "");
    }
  }, [form, supplier, supplierId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Register New Supplier</DialogTitle>
          <DialogDescription className="hidden">
            Register new supplier
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Name</FormLabel>
                    <FormControl>
                      <div className="flex relative">
                        <FactoryIcon className="absolute top-1 bottom-1 left-1 text-primary" />
                        <Input {...field} className="pl-9" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* sales person */}
              <FormField
                control={form.control}
                name="salesPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sales Person</FormLabel>
                    <FormControl>
                      <div className="flex relative">
                        <UserRoundIcon className="absolute top-1 bottom-1 left-1 text-primary" />
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
                    {editMode ? "Update" : "Register"}
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
export default AddSupplierDialog;
