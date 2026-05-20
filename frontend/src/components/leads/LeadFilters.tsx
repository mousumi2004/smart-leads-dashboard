import { RotateCcw, Search } from "lucide-react";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import { LEAD_SOURCES, LEAD_STATUSES, type LeadFilters as LeadFiltersType } from "../../types/lead";

interface LeadFiltersProps {
  filters: LeadFiltersType;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onFiltersChange: (filters: Partial<LeadFiltersType>) => void;
  onClear: () => void;
}

export function LeadFilters({
  filters,
  onClear,
  onFiltersChange,
  onSearchChange,
  searchValue
}: LeadFiltersProps) {
  const hasActiveFilters = Boolean(filters.status || filters.source || searchValue || filters.sort !== "latest");

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-9 h-4 w-4 text-stone-400" />
          <Input
            className="pl-9"
            label="Search"
            name="search"
            placeholder="Name or email"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
        <Select
          label="Status"
          name="status"
          value={filters.status}
          options={[
            { label: "All statuses", value: "" },
            ...LEAD_STATUSES.map((status) => ({ label: status, value: status }))
          ]}
          onChange={(event) => onFiltersChange({ status: event.target.value as LeadFiltersType["status"] })}
        />
        <Select
          label="Source"
          name="source"
          value={filters.source}
          options={[
            { label: "All sources", value: "" },
            ...LEAD_SOURCES.map((source) => ({ label: source, value: source }))
          ]}
          onChange={(event) => onFiltersChange({ source: event.target.value as LeadFiltersType["source"] })}
        />
        <Select
          label="Sort"
          name="sort"
          value={filters.sort}
          options={[
            { label: "Latest first", value: "latest" },
            { label: "Oldest first", value: "oldest" }
          ]}
          onChange={(event) => onFiltersChange({ sort: event.target.value as LeadFiltersType["sort"] })}
        />
        <div className="flex items-end">
          <Button
            className="w-full"
            disabled={!hasActiveFilters}
            icon={<RotateCcw className="h-4 w-4" />}
            type="button"
            variant="secondary"
            onClick={onClear}
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
