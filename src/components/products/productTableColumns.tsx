import { formatPrice } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "../ui/checkbox";
import { TableDataProductsPicker } from "../ProductsPickerDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

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
      return <div>{productNumber?.toUpperCase()}</div>;
    },
  },
  {
    accessorKey: "quantity",
    header: "Stock Balance",
    cell: ({ row }) => {
      const quantity = parseFloat(row.getValue("quantity") ?? 0);
      const unit = row.getValue("unit") as string;
      return (
        <div className="ml-6 flex items-center gap-2">
          <span>{quantity}</span>
          <span className="uppercase">{unit}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "purchasedPrice",
    header: "Purchased Price",
    cell: ({ row }) => {
      const prices = row.getValue("purchasedPrice") as Set<number>;
      const pricesArr = prices?.size >= 1 ? Array?.from(prices) : [];
      const sellMode = row.original.sellMode;
      if (sellMode) {
        if (pricesArr.length > 1) {
          return (
            <div className="flex items-center gap-2">
              {pricesArr.slice(0, 2).map((item, index) => {
                return <div key={index}>{formatPrice(item)}</div>;
              })}

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <p className="text-primary font-semibold cursor-pointer text-xs">
                      more...
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="flex flex-col gap-1 p-1 shadow-md">
                      {pricesArr.map((item, index) => {
                        return <div key={index}>{formatPrice(item)}</div>;
                      })}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        }
        return <div>{pricesArr.length && formatPrice(pricesArr[0])}</div>;
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
    accessorKey: "unit",
    header: "",
    cell: ({}) => {
      return <div></div>;
    },
  },
];
