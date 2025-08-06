"use server";
import { db } from "@/server/db";
import { NewProductSchema } from "@/lib/schema";
import { z } from "zod";
import { and, asc, count, desc, eq, ilike, or, sql } from "drizzle-orm";
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

export const getProducts = async (userId: string) => {
  const allProducts = await db.query.products.findMany({
    with: {
      suppliers: true,
      unitOfMeasurements: true,
    },
    where: eq(products.userId, userId),
    orderBy: desc(products.createdAt),
  });
  return allProducts as ProductExt[];
};

export const getProductsBySupplier = async ({
  supplierId,
  userId,
}: {
  supplierId: string;
  userId: string;
}) => {
  const allProducts = await db.query.products.findMany({
    where: and(
      eq(products.supplierId, supplierId),
      eq(products.userId, userId)
    ),
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
  userId,
  searchTerm,
}: {
  supplierId: string;
  page: number;
  userId: string;
  pageSize?: number;
  searchTerm: string;
}) => {
  const fSearch = `%${searchTerm}%`;

  if (searchTerm?.length) {
    const allProducts = await db.query.products.findMany({
      where: sql`${products.userId} like ${userId} and ${products.supplierId} like ${supplierId} and ${products.productNumber} ilike ${fSearch}`,
      with: {
        suppliers: true,
        unitOfMeasurements: true,
      },
      orderBy: asc(products.productNumber),
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });
    return allProducts as ProductExt[];
  } else {
    const allProducts = await db.query.products.findMany({
      where: and(
        eq(products.supplierId, supplierId),
        eq(products.userId, userId)
      ),
      with: {
        suppliers: true,
        unitOfMeasurements: true,
      },
      orderBy: desc(products.createdAt),
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    return allProducts as ProductExt[];
  }
};

export const getProductsCount = async ({
  supplierId,
  userId,
}: {
  supplierId: string;
  userId: string;
}) => {
  const productCount = await db
    .select({ count: count() })
    .from(products)
    .where(
      and(eq(products.supplierId, supplierId), eq(products.userId, userId))
    );
  return productCount[0];
};

export const getProductById = async ({
  productId,
  userId,
}: {
  productId: string;
  userId: string;
}) => {
  // const product = await db.select().from(products).where(eq(products.id, id));
  const product = await db.query.products.findFirst({
    where: and(eq(products.id, productId), eq(products.userId, userId)),
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
  userId,
}: {
  data: z.infer<typeof NewProductSchema> & {
    supplierId: string;
    unitId: string;
  };
  productId: string | undefined;
  userId: string;
}) => {
  try {
    if (productId) {
      const updatedProduct = await db
        .update(products)
        .set({ ...data, userId })
        .where(and(eq(products.id, productId), eq(products.userId, userId)))
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
        .where(
          and(
            ilike(products.productNumber, data.productNumber),
            eq(products.userId, userId)
          )
        );
      if (exist.length) return { error: "This product already Exist" };

      const newProduct = await db
        .insert(products)
        .values({ ...data, userId })
        .returning();
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

export const deleteProduct = async ({
  productId,
  userId,
}: {
  productId: string;
  userId: string;
}) => {
  try {
    const deletedProduct = await db
      .delete(products)
      .where(and(eq(products.id, productId), eq(products.userId, userId)))
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
