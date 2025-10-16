"use client";
import {
  useProductById,
  useProductsBySupplierPagination,
  useProductsCount,
} from "@/server/backend/queries/productQueries";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  EyeIcon,
  FilePenLineIcon,
  // FilePenLineIcon,
  Loader2Icon,
  Trash2Icon,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import DeleteProductDialog from "./DeleteProductDialog";
import SupplierPicker from "../SupplierPicker";
import { useEffect, useState } from "react";
import { Supplier } from "@/server/db/schema/suppliers";
import ViewProductDialog from "./ViewProductDialog";
// import { TbShoppingCartDown } from "react-icons/tb";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import Pagination from "rc-pagination";
import "rc-pagination/assets/index.css";
import { User } from "@/server/db/schema/users";
import { format } from "date-fns";
import { useProductStore } from "@/store/productStore";
import { Input } from "../ui/input";
import { useDebounce } from "use-debounce";
import { useSupplierById } from "@/server/backend/queries/supplierQueries";

interface Props {
  user: User;
}

const AllProducts = ({ user }: Props) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  //supplier
  const [supplier, setSupplier] = useState<Supplier>({} as Supplier);
  const { currentSupplier } = useProductStore();
  const { data: dbSupplier } = useSupplierById({
    supplierId: currentSupplier.id,
    userId: user.id,
  });

  const [productId, setProductId] = useState("");
  const [page, setPage] = useState(1);
  const [isError, setIsError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [bouncedSearchTerm] = useDebounce(searchTerm, 1000);

  const { data: product } = useProductById({ productId, userId: user?.id });
  const { data: productsBySupplierPagination, isLoading } =
    useProductsBySupplierPagination({
      supplierId: supplier && supplier.id ? supplier.id : currentSupplier.id,
      // supplierId: "c55b7f22-38cb-40d4-bad4-4cb1bf63c4ab",
      userId: user?.id,
      // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
      page,
      searchTerm:
        bouncedSearchTerm.length < 3 ? "" : bouncedSearchTerm.toUpperCase(),
    });

  const { data: productsCount } = useProductsCount({
    supplierId: supplier && supplier.id ? supplier.id : currentSupplier.id,
    // supplierId: "c55b7f22-38cb-40d4-bad4-4cb1bf63c4ab",
    userId: user?.id,
    // userId: "7e397cd1-19ad-4c68-aa50-a77c06450bc7",
  });

  useEffect(() => {
    if (searchParams && searchParams.get("productId")) {
      setProductId(searchParams.get("productId") as string);
      if (product && product.suppliers) {
        setSupplier(product.suppliers);
      }
    }
  }, [searchParams, product]);

  return (
    <div className="flex w-full flex-col">
      <Card className="dark:bg-transparent dark:border-primary/40">
        <CardHeader className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-4xl font-bold">All Products</CardTitle>
            <div className="flex items-center gap-4">
              {/* supplier picker */}
              <SupplierPicker
                setSupplier={setSupplier}
                supplierId={dbSupplier?.length ? dbSupplier[0]?.id : ""}
                userId={user?.id}
              />

              {/* buy products */}
              <Button
                variant="secondary"
                className="font-semibold border border-primary"
                onClick={() => router.push("/products/buy-products")}
              >
                BUY Products
              </Button>

              {/* sell products */}
              <Button
                variant="secondary"
                className="font-semibold border border-primary"
                onClick={() => router.push("/products/sell-products")}
              >
                SELL Products
              </Button>

              {/* new products */}
              <Button
                className="font-semibold"
                onClick={() => router.push("/products/add-product")}
              >
                New Product
              </Button>
            </div>
          </div>

          {/* search */}
          <div className="pt-6 flex flex-col relative">
            <Input
              placeholder="search by product number..."
              value={searchTerm}
              onBlur={() => setIsError(false)}
              onFocus={() => setIsError(true)}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setSearchTerm("");
                }
              }}
            />
            {searchTerm.length ? (
              <p
                className="text-xl text-muted-foreground font-semibold absolute right-3 top-[26px] p-1 cursor-pointer"
                onClick={() => setSearchTerm("")}
              >
                X
              </p>
            ) : null}
            {isError && searchTerm.length < 3 && searchTerm.length !== 0 && (
              <p className="text-sm text-red-500">
                please type at least 3 characters
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !(supplier.id || currentSupplier.id) ? (
            <div className="flex flex-col gap-2 w-full mt-8 justify-center items-center dark:text-slate-400 text-slate-500">
              <h1 className="text-4xl font-bold">Please Select Supplier...</h1>
            </div>
          ) : !productsBySupplierPagination?.length ? (
            <div className="flex flex-col gap-2 w-full mt-8 justify-center items-center dark:text-slate-400 text-slate-500">
              <h1 className="text-4xl font-bold">No Products Found!</h1>
              <p>Please add Product</p>
            </div>
          ) : (
            <div className="mt-8 flex-col">
              <Table className="w-full text-base">
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Date</TableHead>
                    <TableHead className="whitespace-nowrap">
                      Product Number
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      Description
                    </TableHead>
                    <TableHead>UOM</TableHead>
                    <TableHead>Supplier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="w-full">
                  {productsBySupplierPagination?.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="uppercase whitespace-nowrap">
                        {format(product.createdAt, "yyyy-MM-dd")}
                      </TableCell>
                      <TableCell className="uppercase whitespace-nowrap">
                        {product.productNumber}
                      </TableCell>
                      <TableCell className="uppercase whitespace-nowrap">
                        {product &&
                        product.description &&
                        product.description?.length > 45
                          ? `${product.description?.slice(0, 45)}...`
                          : product.description}
                      </TableCell>
                      <TableCell className="uppercase">
                        {product.unitOfMeasurements.unit}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {product.suppliers.name}
                      </TableCell>

                      <TableCell className="flex items-center gap-4">
                        {/* delete */}
                        <TooltipProvider>
                          <Tooltip>
                            <DeleteProductDialog
                              product={product}
                              userId={user?.id}
                            >
                              <TooltipTrigger asChild>
                                <Trash2Icon className="w-5 h-5 text-red-500 cursor-pointer" />
                              </TooltipTrigger>
                            </DeleteProductDialog>
                            <TooltipContent>
                              <p className="text-sm">delete product</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* edit */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <FilePenLineIcon
                                onClick={() =>
                                  router.push(
                                    `/products/edit-product/${product.id}`
                                  )
                                }
                                className="w-5 h-5 cursor-pointer"
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm">edit product</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* view */}
                        <ViewProductDialog product={product}>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <EyeIcon
                                  className="w-5 h-5 cursor-pointer"
                                  onClick={() =>
                                    router.push(`/products/${product.id}`)
                                  }
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">view product</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </ViewProductDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {productsBySupplierPagination?.length && !searchTerm.length ? (
        <div className="self-end mt-6">
          <Pagination
            pageSize={10}
            onChange={(current) => {
              setPage(current);
            }}
            style={{ color: "red" }}
            current={page}
            total={productsCount?.count}
            showPrevNextJumpers
            showTitle={false}
          />
        </div>
      ) : null}
    </div>
  );
};
export default AllProducts;
