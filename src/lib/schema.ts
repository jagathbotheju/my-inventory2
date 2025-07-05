import { z } from "zod";

export const DateRangeSchema = z.object({
  date: z
    .object(
      {
        from: z.date(),
        to: z.date(),
      },
      { required_error: "Date is required" }
    )
    .refine((date) => {
      return !!date.from;
    }, "Date is required"),
});

export const SearchSchema = z.object({
  searchTerm: z.string().min(3, {
    message: "must be at least 3 characters.",
  }),
});

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

export const BuyProductsSchema = z.object({
  date: z.date({ required_error: "purchase date is required" }),
  invoiceNumber: z.string().min(1, "invoice number is required"),
  paymentMode: z.string().min(1, "payment mode is required"),
  cacheAmount: z.coerce.number().optional(),
  creditAmount: z.coerce.number().optional(),
  cheques: z
    .array(
      z.object({
        chequeNumber: z.string().optional(),
        chequeDate: z.date().optional(),
        bankName: z.string().optional(),
        amount: z.coerce.number().optional(),
      })
    )
    .optional(),
  products: z
    .array(
      z.object({
        productId: z.string().optional(),
        productNumber: z.string().optional(),
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

export const AddTxPaymentSchema = z.object({
  paymentMode: z.string(),
  cashAmount: z.coerce.number().optional(),
  creditAmount: z.coerce.number().optional(),
  cheques: z
    .array(
      z.object({
        chequeNumber: z.string().optional(),
        chequeDate: z.date().optional(),
        bankName: z.string().optional(),
        amount: z.coerce.number().optional(),
      })
    )
    .optional(),
});
// .superRefine((values, ctx) => {
//   if (values.paymentMode === "cash" && !values.cashAmount) {
//     ctx.addIssue({
//       message: "cash amount required",
//       code: z.ZodIssueCode.custom,
//       path: ["cashAmount"],
//     });
//   }

//   if (values.paymentMode === "credit" && !values.creditAmount) {
//     ctx.addIssue({
//       message: "credit amount required",
//       code: z.ZodIssueCode.custom,
//       path: ["creditAmount"],
//     });
//   }

//   if (
//     values.paymentMode === "cheque" &&
//     values.cheques &&
//     values.cheques.length
//   ) {
//     values.cheques.map((item, index) => {
//       if (!item.amount) {
//         ctx.addIssue({
//           message: "cheque amount required",
//           code: z.ZodIssueCode.custom,
//           path: ["values", "cheques", index, "amount"],
//         });
//       }
//       if (!item.bankName) {
//         ctx.addIssue({
//           message: "bank required",
//           code: z.ZodIssueCode.custom,
//           path: ["values", "cheques", index, "bankName"],
//         });
//       }
//     });
//   }
// });

export const SellProductsSchema = z.object({
  date: z.date({ required_error: "purchase date is required" }),
  invoiceNumber: z.string().min(1, "invoice number is required"),
  paymentMode: z.string().min(1, "payment mode is required"),
  cacheAmount: z.coerce.number().optional(),
  creditAmount: z.coerce.number().optional(),
  cheques: z
    .array(
      z.object({
        chequeNumber: z.string().optional(),
        chequeDate: z.date().optional(),
        bankName: z.string().optional(),
        amount: z.coerce.number().optional(),
      })
    )
    .optional(),
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
  supplier: z.string().min(1, "supplier name is required"),
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
