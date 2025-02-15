"use client";
import { useUoms } from "@/server/backend/queries/umoQueries";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import AddUomDialog from "./AddUomDialog";
import { Button } from "../ui/button";
import { Loader2Icon, Trash2Icon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import DeleteUomDialog from "./DeleteUomDialog";

const Uoms = () => {
  const { data: uoms, isLoading } = useUoms();

  return (
    <Card className="flex flex-col w-full h-fit bg-transparent dark:border-primary/40">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-4xl font-bold">
            Unit of Measurement
          </CardTitle>

          <AddUomDialog>
            <Button className="font-semibold">New UOM</Button>
          </AddUomDialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2Icon className="w-10 h-10 animate-spin" />
          </div>
        ) : !uoms?.length ? (
          <div className="flex flex-col gap-2 w-full mt-8 justify-center items-center dark:text-slate-400 text-slate-500">
            <h1 className="text-4xl font-bold">No UMOs Found!</h1>
            <p className="font-semibold text-2xl">
              You can add New Unit Of Measurement here...
            </p>
          </div>
        ) : (
          <div className="mt-8 flex-col">
            <Table className="w-full text-xl">
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>UNIT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uoms?.map((uom) => (
                  <TableRow key={uom.id}>
                    <TableCell>{uom.id}</TableCell>
                    <TableCell className="uppercase">{uom.unit}</TableCell>

                    <TableCell>
                      <DeleteUomDialog uom={uom}>
                        <Trash2Icon className="w-5 h-5 text-red-500 cursor-pointer" />
                      </DeleteUomDialog>
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
export default Uoms;
