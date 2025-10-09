"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  RowSelectionState,
  VisibilityState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { useProductStore } from "@/store/productStore";
import { TableDataProductsPicker } from "./ProductsPickerDialog";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  sellMode?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  sellMode,
}: DataTableProps<TData, TValue>) {
  const { setSelectedProducts, setSelectedProductIds, selectedProductIds } =
    useProductStore();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(
    selectedProductIds ? selectedProductIds : {}
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnFilters,
      rowSelection,
      columnVisibility,
    },
    enableRowSelection: true,
  });

  useEffect(() => {
    const column = table.getColumn("purchasedPrice");

    if (sellMode) {
      column?.toggleVisibility(true);
    } else {
      column?.toggleVisibility(false);
    }
    if (rowSelection) {
      const selectedRows = table.getSelectedRowModel().rows;
      const data: TableDataProductsPicker[] = selectedRows.map((row) => {
        return {
          productId: row.getValue("productId"),
          productNumber: row.getValue("productNumber"),
          unit: row.getValue("unit"),
          quantity: row.getValue("quantity"),
          purchasedPrice: row.getValue("purchasedPrice"),
          selectedRowId: row.id,
        };
      });
      if (data.length) {
        setSelectedProducts(data);
        setSelectedProductIds(rowSelection);
      }
    }
  }, [
    rowSelection,
    table,
    setSelectedProducts,
    setSelectedProductIds,
    sellMode,
  ]);

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter Product Number..."
          value={
            (table.getColumn("productNumber")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("productNumber")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">
              page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
