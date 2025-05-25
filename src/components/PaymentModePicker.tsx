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
import { Check, ChevronsUpDown } from "lucide-react";
import { cn, paymentModes } from "@/lib/utils";
import { useState } from "react";

const PaymentModePicker = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="dark:bg-slate-900">
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between text-lg"
        >
          {value
            ? paymentModes?.find((item) => item.value === value)?.label
            : "Select Payment Mode..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 dark:bg-slate-900 w-full">
        <Command className="dark:bg-slate-900 w-full">
          <CommandInput placeholder="Search customers..." className="w-full" />
          <CommandList className="w-full">
            <CommandEmpty>No customers found</CommandEmpty>
            <CommandGroup className="w-full">
              {paymentModes?.map((item) => (
                <CommandItem
                  className="text-lg"
                  key={item.value}
                  value={item.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
export default PaymentModePicker;
