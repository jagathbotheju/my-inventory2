"use client";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { FilePenLineIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import AddCustomerDialog from "./AddCustomerDialog";
import { useCustomers } from "@/server/backend/queries/customerQueries";
import DeleteCustomerDialog from "./DeleteCustomerDialog";
import { User } from "@/server/db/schema/users";

interface Props {
  user: User;
}

const Customers = ({ user }: Props) => {
  const { data: customers, isLoading } = useCustomers(user?.id);

  return (
    <Card className="flex flex-col w-full h-fit bg-transparent dark:border-primary/40">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-4xl font-bold">Customers</CardTitle>

          <AddCustomerDialog userId={user?.id}>
            <Button className="font-semibold">New Customer</Button>
          </AddCustomerDialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !customers?.length ? (
          <div className="flex flex-col gap-2 w-full mt-8 justify-center items-center dark:text-slate-400 text-slate-500">
            <h1 className="text-4xl font-bold">No Customers Found!</h1>
            <p className="font-semibold text-2xl">
              You can Register New Customers here...
            </p>
          </div>
        ) : (
          <div className="mt-8 flex-col">
            <Table className="w-full text-xl">
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Land Phone</TableHead>
                  <TableHead>Mobile Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers?.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      {customer.suppliers?.name || "No Supplier"}
                    </TableCell>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.address}</TableCell>
                    <TableCell>{customer.landPhone}</TableCell>
                    <TableCell>{customer.mobilePhone}</TableCell>
                    <TableCell>
                      <DeleteCustomerDialog customer={customer}>
                        <Trash2Icon className="w-5 h-5 text-red-500 cursor-pointer" />
                      </DeleteCustomerDialog>
                    </TableCell>
                    <TableCell>
                      <AddCustomerDialog
                        customerId={customer.id}
                        userId={user?.id}
                      >
                        <FilePenLineIcon className="w-5 h-5 text-red-500 cursor-pointer" />
                      </AddCustomerDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
export default Customers;
