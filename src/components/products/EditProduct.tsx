"use client";
import SupplierPicker from "../SupplierPicker";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import UomPicker from "../UomPicker";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Supplier } from "@/server/db/schema/suppliers";
import { UnitOfMeasurement } from "@/server/db/schema/unitOfMeasurements";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NewProductSchema } from "@/lib/schema";
import { useAddProduct } from "@/server/backend/mutations/productMutations";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useProductById } from "@/server/backend/queries/productQueries";

interface Props {
  productId: string;
  userId: string;
}

const EditProduct = ({ productId, userId }: Props) => {
  const router = useRouter();
  const [supplier, setSupplier] = useState<Supplier>({} as Supplier);
  const [uom, setUom] = useState<UnitOfMeasurement>({} as UnitOfMeasurement);

  const { mutate: addProduct } = useAddProduct();
  const { data: product } = useProductById({ productId, userId });

  const form = useForm<z.infer<typeof NewProductSchema>>({
    resolver: zodResolver(NewProductSchema),
    defaultValues: {
      productNumber: product ? product?.productNumber : "",
      description: product && product.description ? product?.description : "",
    },
    mode: "all",
  });

  const onSubmit = (formData: z.infer<typeof NewProductSchema>) => {
    const data = {
      ...formData,
      supplierId: supplier.id,
      unitId: uom.id,
      userId,
    };
    addProduct(
      { data, productId, userId },
      {
        onSuccess(data) {
          const { success } = data;
          if (success) router.push(`/products/?productId=${productId}`);
        },
      }
    );
  };

  useEffect(() => {
    if (product) {
      form.setValue("productNumber", product.productNumber);
      form.setValue("description", product.description as string);
      setSupplier(product.suppliers);
      setUom(product.unitOfMeasurements);
      form.trigger("description");
      form.trigger("productNumber");
    }
  }, [product, form]);

  return (
    <Card className="flex flex-col w-[60%] h-fit dark:bg-transparent dark:border-primary/40">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Edit Product</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <p className="col-span-1">Supplier</p>
              <div className="col-span-3">
                <SupplierPicker
                  setSupplier={setSupplier}
                  supplierId={product?.suppliers?.id}
                  userId={userId}
                />
              </div>

              <p className="col-span-1">UOM</p>
              <div className="col-span-3">
                <UomPicker
                  setUom={setUom}
                  unitId={product?.unitOfMeasurements?.id}
                />
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
                  <FormMessage />
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
                  <FormMessage />
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
                onClick={() => router.push(`/products/?productId=${productId}`)}
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
export default EditProduct;
