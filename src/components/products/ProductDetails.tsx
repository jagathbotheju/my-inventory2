"use client";

import { useProductById } from "@/server/backend/queries/productQueries";
import { Loader2Icon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

interface Props {
  productId: string;
  userId: string;
}

const ProductDetails = ({ productId, userId }: Props) => {
  const router = useRouter();
  const { data: product, isLoading } = useProductById({ productId, userId });
  console.log("product", product);

  return (
    <Card className="flex flex-col  h-fit dark:bg-transparent dark:border-primary/40">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">Product Details</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {isLoading ? (
          <Loader2Icon className="w-6 h-6 animate-spin" />
        ) : (
          <div className="grid grid-cols-12 gap-4">
            {/* product number */}
            <p className="col-span-4 text-2xl text-muted-foreground">
              Product Number
            </p>
            <p className="col-span-8 text-2xl">{product?.productNumber}</p>

            {/* description */}
            <p className="col-span-4 text-2xl text-muted-foreground">
              Description
            </p>
            <p className="col-span-8 text-2xl">{product?.description}</p>

            {/* supplier */}
            <p className="col-span-4 text-2xl text-muted-foreground">
              Supplier
            </p>
            <p className="col-span-8 text-2xl">{product?.suppliers.name}</p>

            {/* sales person */}
            <p className="col-span-4 text-2xl text-muted-foreground">
              Sales Person
            </p>
            <p className="col-span-8 text-2xl">
              {product?.suppliers.salesPerson}
            </p>

            {/* address */}
            <p className="col-span-4 text-2xl text-muted-foreground">Address</p>
            <p className="col-span-8 text-2xl">
              {product && product.suppliers.address
                ? product.suppliers.address
                : "not found"}
            </p>

            {/* land phone */}
            <p className="col-span-4 text-2xl text-muted-foreground">
              Office Phone
            </p>
            <p className="col-span-8 text-2xl">
              {product && product.suppliers.landPhone
                ? product.suppliers.landPhone
                : "not found"}
            </p>

            {/* mobile */}
            <p className="col-span-4 text-2xl text-muted-foreground">
              Mobile Phone
            </p>
            <p className="col-span-8 text-2xl">
              {product && product.suppliers.mobilePhone
                ? product.suppliers.mobilePhone
                : "not found"}
            </p>

            {/* email */}
            <p className="col-span-4 text-2xl text-muted-foreground">E-Mail</p>
            <p className="col-span-8 text-2xl">
              {product && product.suppliers.email
                ? product.suppliers.email
                : "not found"}
            </p>
          </div>
        )}

        <Button
          className="w-fit"
          onClick={() => router.push(`/products/?productId=${productId}`)}
        >
          Back
        </Button>
      </CardContent>
    </Card>
  );
};
export default ProductDetails;
