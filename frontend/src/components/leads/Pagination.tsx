import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../common/Button";
import type { PaginationMeta } from "../../types/api";

interface PaginationProps {
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  if (!meta) return null;

  const currentPage = meta.currentPage ?? meta.page ?? 1;
  const total = meta.totalRecords ?? meta.total ?? 0;

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-stone-200 px-4 py-3 text-sm text-stone-600 sm:flex-row">
      <p>
        Page <span className="font-semibold text-stone-950">{currentPage}</span> of{" "}
        <span className="font-semibold text-stone-950">{meta.totalPages}</span> · {total} records
      </p>
      <div className="flex gap-2">
        <Button
          icon={<ChevronLeft className="h-4 w-4" />}
          type="button"
          variant="secondary"
          disabled={!meta.hasPreviousPage}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </Button>
        <Button
          icon={<ChevronRight className="h-4 w-4" />}
          type="button"
          variant="secondary"
          disabled={!meta.hasNextPage}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
