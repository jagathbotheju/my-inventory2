"use client";

import { useSuppliers } from "@/server/backend/queries/supplierQueries";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import AddSupplierDialog from "./AddSupplierDialog";
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
import DeleteSupplierDialog from "./DeleteSupplierDialog";
import { User } from "@/server/db/schema/users";

interface Props {
  user: User;
}

const Suppliers = ({ user }: Props) => {
  const { data: suppliers, isLoading } = useSuppliers(user?.id);

  return (
    <Card className="flex flex-col w-full h-fit bg-transparent dark:border-primary/40">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-4xl font-bold">Suppliers</CardTitle>

          <AddSupplierDialog userId={user?.id}>
            <Button className="font-semibold">New Supplier</Button>
          </AddSupplierDialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2Icon className="w-10 h-10 animate-spin" />
          </div>
        ) : !suppliers?.length ? (
          <div className="flex flex-col gap-2 w-full mt-8 justify-center items-center dark:text-slate-400 text-slate-500">
            <h1 className="text-4xl font-bold">No Suppliers Found!</h1>
            <p className="font-semibold text-2xl">
              You can Register New Suppliers here...
            </p>
          </div>
        ) : (
          <div className="mt-8 flex-col">
            <Table className="w-full text-xl">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Sales Person</TableHead>
                  <TableHead>Land Phone</TableHead>
                  <TableHead>Mobile Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers?.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>{supplier.name}</TableCell>
                    <TableCell>{supplier.salesPerson}</TableCell>
                    <TableCell>{supplier.landPhone}</TableCell>
                    <TableCell>{supplier.mobilePhone}</TableCell>
                    <TableCell>
                      <DeleteSupplierDialog supplier={supplier} user={user}>
                        <Trash2Icon className="w-5 h-5 text-red-500 cursor-pointer" />
                      </DeleteSupplierDialog>
                    </TableCell>
                    <TableCell>
                      <AddSupplierDialog
                        supplierId={supplier.id}
                        userId={user?.id}
                        editMode
                      >
                        <FilePenLineIcon className="w-5 h-5 text-red-500 cursor-pointer" />
                      </AddSupplierDialog>
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
export default Suppliers;
