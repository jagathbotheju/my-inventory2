"use client";

import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { z } from "zod";
import { NewUomSchema } from "@/lib/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { RulerIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { useAddUom } from "@/server/backend/mutations/uomMutations";

interface Props {
  children: React.ReactNode;
}

const AddUomDialog = ({ children }: Props) => {
  const [open, setOpen] = useState(false);

  const { mutate: addUom } = useAddUom();

  const form = useForm<z.infer<typeof NewUomSchema>>({
    resolver: zodResolver(NewUomSchema),
    defaultValues: {
      unit: "",
    },
    mode: "all",
  });

  const onSubmit = (formData: z.infer<typeof NewUomSchema>) => {
    addUom(formData);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New UOM</DialogTitle>
          <DialogDescription className="hidden">add new UOM</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* unit */}
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <div className="flex relative">
                        <RulerIcon className="absolute top-1 bottom-1 left-1 text-primary" />
                        <Input {...field} className="pl-9 uppercase" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="sm:justify-start">
                <div className="flex gap-2">
                  <Button
                    disabled={!form.formState.isValid}
                    onClick={() => setOpen(false)}
                    type="submit"
                  >
                    ADD
                  </Button>
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => form.reset()}
                    >
                      Close
                    </Button>
                  </DialogClose>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default AddUomDialog;
