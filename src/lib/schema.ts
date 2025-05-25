import { z } from "zod";

export const BuyProductSchema = z.object({
  unitPrice: z.coerce
    .number()
    .refine(async (val) => val > 0, "must be a positive number"),
  quantity: z.coerce
    .number({
      message: "must be a number",
    })
    .int({
      message: "must be a whole number",
    })
    .positive({
      message: "must be positive value",
    }),
  date: z.date({ required_error: "purchase date is required" }),
  invoiceNumber: z.string().min(1, "invoice number is required"),
});

export const SellProductSchema = z.object({
  unitPrice: z.coerce
    .number()
    .refine(async (val) => val > 0, "must be a positive number"),
  quantity: z.coerce
    .number({
      message: "must be a number",
    })
    .int({
      message: "must be a whole number",
    })
    .positive({
      message: "must be positive value",
    }),
  date: z.date({ required_error: "purchase date is required" }),
  invoiceNumber: z.string().min(1, "invoice number is required"),
});

export const SellProductsSchema = z.object({
  date: z.date({ required_error: "purchase date is required" }),
  invoiceNumber: z.string().min(1, "invoice number is required"),
  products: z
    .array(
      z.object({
        productId: z.string().optional(),
        productNumber: z.string().optional(),
        purchasedPrice: z.number().optional(),
        quantity: z.coerce
          .number({
            message: "must be a number",
          })
          .int({
            message: "must be a whole number",
          })
          .positive({
            message: "must be positive value",
          }),
        unitPrice: z.coerce
          .number()
          .refine(async (val) => val > 0, "must be a positive number"),
      })
    )
    .nonempty({ message: "Product is required" }),
});

export const NewSupplierSchema = z.object({
  name: z.string().min(1, "suppler name is required"),
  salesPerson: z.string().optional(),
  landPhone: z.string().optional(),
  mobilePhone: z.string().optional(),
});

export const NewCustomerSchema = z.object({
  name: z.string().min(1, "customer name is required"),
  address: z.string().optional(),
  landPhone: z.string().optional(),
  mobilePhone: z.string().optional(),
});

export const NewProductSchema = z.object({
  productNumber: z.string().min(1, "product number is required"),
  description: z.string().min(1, "product description is required"),
});

export const NewUomSchema = z.object({
  unit: z.string().min(1, "unit is required"),
});
