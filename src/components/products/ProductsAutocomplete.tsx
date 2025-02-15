import {
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
} from "../ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";
import { ProductExt } from "@/server/db/schema/products";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchProducts } from "@/server/backend/queries/productQueries";

interface Props {
  setProduct: (product: ProductExt) => void;
  product: ProductExt;
}

const ProductsAutoComplete = ({ setProduct, product }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setOpen] = useState(false);
  // const [selected, setSelected] = useState<ProductExt>({} as ProductExt);
  const [inputValue, setInputValue] = useState<string>("");
  const debouncedSearchTerm = useDebounce({ value: inputValue, delay: 1000 });
  const { data: products, isLoading } = useSearchProducts(debouncedSearchTerm);

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

      // This is not a default behaviour of the <input /> field
      if (event.key === "Enter" && input.value !== "") {
        const optionToSelect = products?.find(
          (option) => option.description === input.value
        );
        if (optionToSelect) {
          setProduct(optionToSelect);
          // setSelected?.(optionToSelect);
        }
      }

      if (event.key === "Escape") {
        input.blur();
      }
    },
    [isOpen, products, setProduct]
  );

  const handleBlur = useCallback(() => {
    setOpen(false);
    setInputValue(product?.description as string);
  }, [product, setInputValue]);

  const handleSelectOption = useCallback(
    (selectedOption: ProductExt) => {
      setInputValue(selectedOption.description as string);
      setProduct(selectedOption);

      // This is a hack to prevent the input from being focused after the user selects an option
      // We can call this hack: "The next tick"
      setTimeout(() => {
        inputRef?.current?.blur();
      }, 0);
    },
    [setProduct]
  );

  return (
    <CommandPrimitive onKeyDown={handleKeyDown} className="w-full">
      <div className="w-full flex">
        <CommandInput
          ref={inputRef}
          value={inputValue}
          onValueChange={isLoading ? undefined : setInputValue}
          onBlur={handleBlur}
          onFocus={() => setOpen(true)}
          placeholder="Search product..."
          className="text-base md:w-[600px]"
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
            {isLoading || !products ? (
              <CommandPrimitive.Loading>
                <div className="p-1">
                  <Skeleton className="h-8 w-full" />
                </div>
              </CommandPrimitive.Loading>
            ) : (
              <CommandGroup>
                {products.map((option) => {
                  const isSelected =
                    product?.description === option.description;
                  return (
                    <CommandItem
                      key={option.id}
                      value={option.description as string}
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
                      {option.description}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}

            {!isLoading ? (
              <CommandPrimitive.Empty className="select-none rounded-sm px-2 py-3 text-center text-sm">
                Products not found...
              </CommandPrimitive.Empty>
            ) : null}
          </CommandList>
        </div>
      </div>
    </CommandPrimitive>
  );
};

export default ProductsAutoComplete;
