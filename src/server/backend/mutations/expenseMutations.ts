import { ExpenseSchema } from "@/lib/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { addExpense, deleteExpense } from "../actions/expenseActions";
import { toast } from "sonner";

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      expenseId,
    }: {
      userId: string;
      expenseId: string;
    }) => deleteExpense({ userId, expenseId }),
    onSuccess: async (res) => {
      if (res.success) {
        toast.success(res.success);
        queryClient.invalidateQueries({
          queryKey: ["expenses"],
        });
      }
      if (res.error) {
        toast.error(res.error);
      }
    },
    onError: (error) => {
      console.log("error", error);
      toast.error("Could not Delete Expense");
    },
  });
};

export const useAddExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      formData,
      userId,
    }: {
      formData: z.infer<typeof ExpenseSchema>;
      userId: string;
    }) => addExpense({ formData, userId }),
    onSuccess: async (res) => {
      if (res.success) {
        toast.success(res.success);
        queryClient.invalidateQueries({
          queryKey: ["expenses"],
        });
      }
      if (res.error) {
        toast.error(res.error);
      }
    },
    onError: (error) => {
      console.log("error", error);
      toast.error("Could not add New Expense");
    },
  });
};
