"use client";
import { Supplier } from "@/server/db/schema/suppliers";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSuppliers } from "@/server/backend/queries/supplierQueries";
import { useEffect, useState } from "react";

interface Props {
  setSupplier: (supplier: Supplier) => void;
  supplierId?: string;
  userId: string;
}

const SupplierPicker = ({ setSupplier, supplierId, userId }: Props) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const { data: suppliers, isLoading } = useSuppliers(userId);

  useEffect(() => {
    if (supplierId) {
      setValue(supplierId);
    }
  }, [supplierId]);

  return (
    <div className="flex">
      {isLoading ? (
        <Loader2Icon className="w-4 h-4 animate-spin" />
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild className="dark:bg-slate-900">
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {value
                ? suppliers?.find((item) => item.id === value)?.name
                : "Select supplier..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 dark:bg-slate-900 w-full">
            <Command className="dark:bg-slate-900 w-full">
              <CommandInput
                placeholder="Search suppliers..."
                className="w-full"
              />
              <CommandList>
                <CommandEmpty>No suppliers found</CommandEmpty>
                <CommandGroup>
                  {suppliers?.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? "" : currentValue);
                        setSupplier(item);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === item.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {item.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
export default SupplierPicker;
