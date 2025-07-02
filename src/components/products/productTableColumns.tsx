import { formatPrice } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "../ui/checkbox";
import { TableDataProductsPicker } from "../ProductsPickerDialog";

export const productTableColumns: ColumnDef<TableDataProductsPicker>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "productNumber",
    header: "Product Number",
    cell: ({ row }) => {
      const productNumber = row.getValue("productNumber") as string;
      return <div>{productNumber.toUpperCase()}</div>;
    },
  },
  {
    accessorKey: "quantity",
    header: "Stock Balance",
    cell: ({ row }) => {
      const quantity = parseFloat(row.getValue("quantity"));
      return <div className="ml-6">{quantity}</div>;
    },
  },
  {
    accessorKey: "purchasedPrice",
    header: "Purchased Price",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("purchasedPrice"));
      const sellMode = row.original.sellMode;
      if (sellMode) {
        return <div>{formatPrice(amount)}</div>;
      } else {
        return <div></div>;
      }
    },
  },
  {
    accessorKey: "productId",
    header: "",
    cell: () => {
      return <div></div>;
    },
  },
  {
    accessorKey: "supplierId",
    header: "",
    cell: () => {
      return <div></div>;
    },
  },
  {
    accessorKey: "unit",
    header: "",
    cell: ({}) => {
      return <div></div>;
    },
  },
];
