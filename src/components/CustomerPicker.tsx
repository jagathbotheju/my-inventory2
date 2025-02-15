"use client";
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
import { useEffect, useState } from "react";
import { Customer } from "@/server/db/schema/customers";
import { useCustomers } from "@/server/backend/queries/customerQueries";

interface Props {
  setCustomer: (customer: Customer) => void;
  customerId?: string;
}

const CustomerPicker = ({ setCustomer, customerId }: Props) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const { data: customers, isLoading } = useCustomers();

  useEffect(() => {
    if (customerId) {
      setValue(customerId);
    }
  }, [customerId]);

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
              className="justify-between text-lg"
            >
              {value
                ? customers?.find((item) => item.id === value)?.name
                : "Select customer..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 dark:bg-slate-900 w-full">
            <Command className="dark:bg-slate-900 w-full">
              <CommandInput
                placeholder="Search customers..."
                className="w-full"
              />
              <CommandList className="w-full">
                <CommandEmpty>No customers found</CommandEmpty>
                <CommandGroup className="w-full">
                  {customers?.map((item) => (
                    <CommandItem
                      className="text-lg"
                      key={item.id}
                      value={item.id}
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? "" : currentValue);
                        setCustomer(item);
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
export default CustomerPicker;
