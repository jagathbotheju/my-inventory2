import { Command as CommandPrimitive } from "cmdk";
import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import { Check, Loader2Icon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import {
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { useSearchCustomers } from "@/server/backend/queries/customerQueries";
import { useQueryClient } from "@tanstack/react-query";
import { Customer } from "@/server/db/schema/customers";

interface Props {
  setCustomer: (customer: Customer | null) => void;
  setDateRange: (dateRange: { from: Date; to: Date }) => void;
  customer: Customer | null;
  userId: string;
}

const CustomersAutoComplete = ({
  setCustomer,
  customer,
  userId,
  setDateRange,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const [isOpen, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");
  const debouncedSearchTerm = useDebounce({ value: inputValue, delay: 1000 });

  const { data: customers, isLoading } = useSearchCustomers({
    searchTerm: debouncedSearchTerm,
    userId: userId as string,
    // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
  });

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (!input) {
        return;
      }

      // Keep the options displayed when the user is typing
      if (!isOpen) {
        setOpen(true);
      }

      // This is not a default behavour of the <input /> field
      if (event.key === "Enter" && input.value !== "") {
        const optionToSelect = customers?.find(
          (option) => option.name === input.value
        );
        if (optionToSelect) {
          setCustomer(optionToSelect);
          // setSelected?.(optionToSelect);
        }
      }

      if (event.key === "Escape") {
        input.blur();
      }
    },
    [isOpen, customers, setCustomer]
  );

  const handleBlur = useCallback(() => {
    setOpen(false);
    setInputValue(customer?.name as string);
  }, [customer, setInputValue]);

  const handleSelectOption = useCallback(
    (selectedOption: Customer) => {
      setInputValue(selectedOption.name as string);
      setCustomer(selectedOption);

      // This is a hack to prevent the input from being focused after the user selects an option
      // We can call this hack: "The next tick"
      setTimeout(() => {
        inputRef?.current?.blur();
      }, 0);
    },
    [setCustomer]
  );

  return (
    <CommandPrimitive onKeyDown={handleKeyDown} className="w-[50%]">
      <div className="w-full flex relative">
        <CommandInput
          ref={inputRef}
          value={inputValue}
          onValueChange={isLoading ? undefined : setInputValue}
          onBlur={handleBlur}
          // onFocus={() => setOpen(true)}
          placeholder="Search customer..."
          className="text-base md:w-[600px]"
        />
        <XIcon
          onClick={() => {
            setInputValue("");
            setCustomer(null);
            setDateRange({ from: new Date(), to: new Date() });
            queryClient.removeQueries({
              queryKey: ["search-customers"],
            });
            queryClient.removeQueries({
              queryKey: ["sell-tx-date-range"],
            });
          }}
          className="absolute right-0 top-2 cursor-pointer"
        />
      </div>
      <div className="relative mt-1 w-full">
        <div
          className={cn(
            "animate-in fade-in-0 zoom-in-95 absolute top-0 z-10 w-full rounded-xl outline-none dark:bg-slate-800",
            isOpen ? "block" : "hidden"
          )}
        >
          <CommandList className="rounded-lg">
            {isLoading ? (
              <CommandPrimitive.Loading>
                <div className="p-1 flex items-center justify-center">
                  <Loader2Icon className="animate-spin text-primary" />
                </div>
              </CommandPrimitive.Loading>
            ) : (
              <CommandGroup>
                {customers?.map((option) => {
                  const isSelected = customer?.name === option.name;
                  return (
                    <CommandItem
                      key={option.id}
                      value={option.name as string}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                      onSelect={() => handleSelectOption(option)}
                      className={cn(
                        "flex w-full items-center gap-2",
                        !isSelected ? "pl-8" : null
                      )}
                    >
                      {isSelected ? <Check className="w-4" /> : null}
                      {option.name}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}

            {!isLoading ? (
              <CommandPrimitive.Empty className="select-none rounded-sm px-2 py-3 text-center text-sm">
                Customers not found...
              </CommandPrimitive.Empty>
            ) : null}
          </CommandList>
        </div>
      </div>
    </CommandPrimitive>
  );
};

export default CustomersAutoComplete;
