"use client";
import { DateRangeSchema } from "@/lib/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { FormField, FormItem, Form } from "./ui/form";
import { Calendar } from "./ui/calendar";

interface Props {
  children: React.ReactNode;
  setDateRange: ({ from, to }: { from: Date; to: Date }) => void;
}

const DateRangePicker = ({ children, setDateRange }: Props) => {
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof DateRangeSchema>>({
    resolver: zodResolver(DateRangeSchema),
    defaultValues: {
      date: {
        from: undefined,
        to: undefined,
      },
    },
  });

  const onSubmit = (dateRange: z.infer<typeof DateRangeSchema>) => {
    setDateRange({
      from: dateRange.date.from,
      to: dateRange.date.to,
    });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-full">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 flex flex-col"
          >
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  {/* <FormLabel>Date</FormLabel> */}
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={field.value.from}
                    selected={{
                      from: field.value.from!,
                      to: field.value.to,
                    }}
                    onSelect={field.onChange}
                    numberOfMonths={2}
                  />

                  {/* <FormMessage /> */}
                </FormItem>
              )}
            />

            <div className="flex items-center gap-2 self-end">
              <Button
                type={"button"}
                variant="secondary"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type={"submit"}>Select</Button>
            </div>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  );
};

export default DateRangePicker;
