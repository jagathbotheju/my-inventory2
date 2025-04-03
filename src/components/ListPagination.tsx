import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

interface Props {
  page: number;
  allPages: number;
  setPage: (page: number) => void;
  handlePreviousPage: () => void;
  handleNextPage: () => void;
}

const ListPagination = ({
  page,
  allPages,
  handlePreviousPage,
  handleNextPage,
  setPage,
}: Props) => {
  return (
    <div className="mt-4 self-end">
      <Pagination>
        <PaginationContent>
          {/* previous page */}
          <PaginationItem>
            <PaginationPrevious
              onClick={handlePreviousPage}
              className="cursor-pointer"
            />
          </PaginationItem>
          {/* 1st item */}
          <PaginationItem className={cn("cursor-pointer")}>
            <PaginationLink
              className={cn(1 === page && "dark:bg-slate-700")}
              isActive={1 === page}
              onClick={() => setPage(1)}
            >
              {1}
            </PaginationLink>
          </PaginationItem>

          {page !== 1 && page > 2 && page !== allPages && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {/* current item */}
          {page !== 1 && page !== allPages && (
            <PaginationItem className={cn("cursor-pointer")}>
              <PaginationLink
                className="dark:bg-slate-700 font-bold"
                isActive
                onClick={() => setPage(2)}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )}

          {page > 2 && page !== allPages && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {/* last item */}
          {allPages && (
            <PaginationItem className={cn("cursor-pointer")}>
              <PaginationLink
                className={cn(allPages === page && "dark:bg-slate-700")}
                isActive={allPages === page}
                onClick={() => setPage(allPages)}
              >
                {allPages}
              </PaginationLink>
            </PaginationItem>
          )}

          {/* next page */}
          <PaginationItem>
            <PaginationNext
              onClick={allPages && page < allPages ? handleNextPage : () => {}}
              className={cn(
                page === allPages ? "cursor-not-allowed" : "cursor-pointer"
              )}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
export default ListPagination;
