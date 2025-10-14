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
import { useState } from "react";
import { useProductStore } from "@/store/productStore";

interface Props {
  setSupplier: (supplier: Supplier) => void;
  supplierId?: string;
  userId: string;
}

const SupplierPicker = ({ setSupplier, supplierId, userId }: Props) => {
  const { setCurrentSupplier, currentSupplier } = useProductStore();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(currentSupplier.id ?? supplierId);
  const { data: suppliers, isLoading } = useSuppliers(userId);

  // useEffect(() => {
  //   console.log("inside useEffect....");
  //   if (supplierId) {
  //     setValue(supplierId);
  //     console.log("setting supplierId", supplierId);
  //   } else {
  //     setValue("");
  //     console.log("setting value to null");
  //   }
  // }, [supplierId]);

  // console.log("supplierId", supplierId);
  // console.log("value", value);

  return (
    <div className="flex">
      {isLoading ? (
        <Loader2Icon className="w-4 h-4 animate-spin text-primary" />
      ) : (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
          <PopoverTrigger asChild className="dark:bg-slate-900">
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between font-semibold"
            >
              {value
                ? suppliers?.find((item) => item.id === value)?.name
                : "Select Supplier..."}
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
                      value={item.name}
                      onSelect={() => {
                        setValue(item.id);
                        setSupplier(item);
                        setCurrentSupplier(item);
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
