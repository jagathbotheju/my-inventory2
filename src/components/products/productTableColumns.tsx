import { formatPrice } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "../ui/checkbox";
import { TableData } from "../ProductsPickerDialog";

export const productTableColumns: ColumnDef<TableData>[] = [
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
  },
  {
    accessorKey: "quantity",
    header: "Stock Balance",
  },
  {
    accessorKey: "purchasedPrice",
    header: "Purchased Price",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("purchasedPrice"));
      return <div>{formatPrice(amount)}</div>;
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
