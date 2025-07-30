"use client";

import { User } from "@/server/db/schema/users";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { formatPrice } from "@/lib/utils";
import { format } from "date-fns";
import { Loader2Icon, Trash2Icon } from "lucide-react";
import { useExpenses } from "@/server/backend/queries/expenseQueries";
import { useTimeFrameStore } from "@/store/timeFrameStore";
import TimeFramePicker from "../TimeFramePicker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import DeleteExpenseDialog from "./DeleteExpenseDialog";
import AddExpenseDialog from "./AddExpenseDialog";
import { Button } from "../ui/button";

interface Props {
  user: User;
}

const Expenses = ({ user }: Props) => {
  const { period, timeFrame } = useTimeFrameStore((state) => state);

  const { data: expenses, isPending } = useExpenses({
    userId: user.id,
    period,
    timeFrame,
  });

  const totalExp = expenses?.reduce(
    (acc, item) => acc + (item?.amount ?? 0),
    0
  );

  return (
    <Card className="dark:bg-transparent dark:border-primary/40 w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">
            Expenses, {formatPrice(totalExp ?? 0)}
          </CardTitle>

          <div className="flex items-center gap-4">
            <TimeFramePicker />
            <AddExpenseDialog userId={user.id}>
              <Button>NEW</Button>
            </AddExpenseDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex w-full justify-center mt-6">
          {isPending ? (
            <div className="flex items-center justify-center">
              <Loader2Icon className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : expenses?.length ? (
            <Table className="text-[1.1rem]">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(expense.date, "yyyy-MMM-dd")}
                    </TableCell>
                    <TableCell className="text-ellipsis overflow-hidden line-clamp-1">
                      {expense.title}
                    </TableCell>
                    <TableCell>{formatPrice(expense.amount ?? 0)}</TableCell>
                    {/* delete */}
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <DeleteExpenseDialog
                            userId={user.id}
                            expenseId={expense.id}
                          >
                            <TooltipTrigger asChild>
                              <Trash2Icon className="w-5 h-5 text-red-500 cursor-pointer" />
                            </TooltipTrigger>
                          </DeleteExpenseDialog>
                          <TooltipContent>
                            <p className="text-sm">delete transaction</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

export default Expenses;
