"use client";

import { useUoms } from "@/server/backend/queries/umoQueries";
import { UnitOfMeasurement } from "@/server/db/schema/unitOfMeasurements";
import { ChevronsUpDown, Loader2Icon, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { cn } from "@/lib/utils";

interface Props {
  setUom: (uom: UnitOfMeasurement) => void;
  unitId?: string;
}

const UomPicker = ({ setUom, unitId }: Props) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const { data: uoms, isLoading } = useUoms();

  useEffect(() => {
    if (unitId) {
      setValue(unitId);
    }
  }, [unitId]);

  return (
    <div className="w-full">
      {isLoading ? (
        <Loader2Icon className="w-4 h-4 animate-spin text-primary" />
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild className="dark:bg-slate-900 w-full">
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="justify-between uppercase w-full"
            >
              {value
                ? uoms?.find((item) => item.id === value)?.unit
                : "Select UMO..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 dark:bg-slate-900 w-full">
            <Command className="dark:bg-slate-900">
              <CommandInput placeholder="Search suppliers..." />
              <CommandList>
                <CommandEmpty>No UOMs found</CommandEmpty>
                <CommandGroup>
                  {uoms?.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      className="uppercase"
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? "" : currentValue);
                        setUom(item);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === item.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {item.unit}
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
export default UomPicker;
