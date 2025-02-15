"use client";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
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
import { Button } from "../ui/button";
import { useState } from "react";
import { Textarea } from "../ui/textarea";
import { useForm } from "react-hook-form";
import { NewProductSchema } from "@/lib/schema";
import { z } from "zod";
import SupplierPicker from "../SupplierPicker";
import { Supplier } from "@/server/db/schema/suppliers";
import UomPicker from "../UomPicker";
import { UnitOfMeasurement } from "@/server/db/schema/unitOfMeasurements";
import { toast } from "sonner";
import { useAddProduct } from "@/server/backend/mutations/productMutations";
import { useRouter } from "next/navigation";
import { useSuppliers } from "@/server/backend/queries/supplierQueries";
import { Loader2Icon } from "lucide-react";

const AddProduct = () => {
  const router = useRouter();
  const [supplier, setSupplier] = useState<Supplier>({} as Supplier);
  const [uom, setUom] = useState<UnitOfMeasurement>({} as UnitOfMeasurement);
  const form = useForm<z.infer<typeof NewProductSchema>>({
    resolver: zodResolver(NewProductSchema),
    defaultValues: {
      productNumber: "",
      description: "",
    },
    mode: "all",
  });

  const { mutate: addProduct } = useAddProduct();
  const { data: suppliers, isLoading } = useSuppliers();

  const onSubmit = (formData: z.infer<typeof NewProductSchema>) => {
    if (!supplier.id) toast.error("Please select a supplier");
    if (!uom.id) toast.error("Please select a UOM");
    const data = { ...formData, supplierId: supplier.id, unitId: uom.id };
    addProduct({ data });
    // setSupplier({} as Supplier);
    // setUom({} as UnitOfMeasurement);
    // form.reset();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <Loader2Icon className="w-10 h-10 animate-spin" />
      </div>
    );
  } else if (!suppliers?.length) {
    return (
      <div className="flex flex-col gap-2 w-full mt-8 justify-center items-center dark:text-slate-400 text-slate-500">
        {/* <div className="animate-pulse flex flex-col w-full gap-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div> */}
        <h1 className="text-4xl font-bold">No Suppliers Found!</h1>
        <p className="font-semibold text-2xl">
          To add New Product, please register New Supplier...
        </p>
      </div>
    );
  }

  return (
    <Card className="flex flex-col w-[60%] h-fit dark:bg-transparent dark:border-primary/40">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Add New Product</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <p className="col-span-1">Supplier</p>
              <div className="col-span-3">
                <SupplierPicker setSupplier={setSupplier} />
              </div>

              <p className="col-span-1">UOM</p>
              <div className="col-span-3">
                <UomPicker setUom={setUom} />
              </div>
            </div>

            {/* product number */}
            <FormField
              control={form.control}
              name="productNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Number</FormLabel>
                  <FormControl>
                    <div className="flex relative">
                      <Input {...field} className="uppercase" />
                    </div>
                  </FormControl>
                  <FormMessage className="dark:text-white" />
                </FormItem>
              )}
            />

            {/* product description] */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <div className="flex relative">
                      <Textarea {...field} className="h-[100px] uppercase" />
                    </div>
                  </FormControl>
                  <FormMessage className="dark:text-white" />
                </FormItem>
              )}
            />

            <div className="flex mt-4 items-center gap-4">
              <Button
                type="submit"
                className="font-semibold"
                disabled={
                  form.formState.isSubmitting || !form.formState.isValid
                }
              >
                ADD
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
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
export default AddProduct;
