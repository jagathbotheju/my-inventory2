"use server";
import { db } from "@/server/db";
import { NewProductSchema } from "@/lib/schema";
import { z } from "zod";
import { count, desc, eq, ilike, or } from "drizzle-orm";
import { ProductExt, products } from "@/server/db/schema/products";

export const searchProducts = async (searchTerm: string) => {
  const searchResult = await db.query.products.findMany({
    with: {
      suppliers: true,
      unitOfMeasurements: true,
    },
    where: or(
      ilike(products.description, `%${searchTerm}%`),
      ilike(products.productNumber, `%${searchTerm}%`)
    ),
    orderBy: desc(products.description),
  });
  return searchResult as ProductExt[];
};

export const getProducts = async () => {
  const allProducts = await db.query.products.findMany({
    with: {
      suppliers: true,
      unitOfMeasurements: true,
    },
    orderBy: desc(products.createdAt),
  });
  return allProducts as ProductExt[];
};

export const getProductsBySupplier = async (supplierId: string) => {
  const allProducts = await db.query.products.findMany({
    where: eq(products.supplierId, supplierId),
    with: {
      suppliers: true,
      unitOfMeasurements: true,
    },
  });
  return allProducts as ProductExt[];
};

export const getProductsBySupplierPagination = async ({
  supplierId,
  page,
  pageSize = 10,
}: {
  supplierId: string;
  page: number;
  pageSize?: number;
}) => {
  const allProducts = await db.query.products.findMany({
    where: eq(products.supplierId, supplierId),
    with: {
      suppliers: true,
      unitOfMeasurements: true,
    },
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });
  return allProducts as ProductExt[];
};

export const getProductsCount = async (supplierId: string) => {
  const productCount = await db
    .select({ count: count() })
    .from(products)
    .where(eq(products.supplierId, supplierId));
  return productCount[0];
};

export const getProductById = async (id: string) => {
  // const product = await db.select().from(products).where(eq(products.id, id));
  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      suppliers: true,
      unitOfMeasurements: true,
    },
  });
  if (product) return product as ProductExt;
  return {} as ProductExt;
};

export const addProduct = async ({
  data,
  productId,
}: {
  data: z.infer<typeof NewProductSchema> & {
    supplierId: string;
    unitId: string;
  };
  productId: string | undefined;
}) => {
  try {
    if (productId) {
      const updatedProduct = await db
        .update(products)
        .set(data)
        .where(eq(products.id, productId))
        .returning();
      if (updatedProduct.length) {
        return { success: "Product updated successfully" };
      }
      return { error: "Could not update Product" };
    } else {
      // const exist = await db.query.products.findFirst({
      //   where: eq(products.productNumber, data.productNumber),
      // });
      const exist = await db
        .select()
        .from(products)
        .where(ilike(products.productNumber, data.productNumber));
      if (exist.length) return { error: "This product already Exist" };

      const newProduct = await db.insert(products).values(data).returning();
      if (newProduct.length) {
        return {
          success: "Product added successfully",
          data: newProduct[0].id,
        };
      }
      return { error: "Could not add Product" };
    }
  } catch (error) {
    console.log(error);
    return { error: "Could not add Product" };
  }
};

export const deleteProduct = async (id: string) => {
  try {
    const deletedProduct = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning();
    if (deletedProduct.length) {
      return { success: "Product deleted successfully" };
    }
    return { error: "Could not delete Product" };
  } catch (error) {
    console.log(error);
    return { error: "Could not delete Product" };
  }
};
