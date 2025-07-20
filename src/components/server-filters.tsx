import { useEffect, useMemo, useState } from "react";

import { ChevronDownIcon, SearchIcon, XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export type FilterState = {
  status: string | null;
  group: string | null;
};

export type FilterInput = {
  status?: string;
  group?: string;
  search?: string;
};

interface ServerFiltersProps {
  availableGroups: string[];
  onFiltersChange: (_filters: FilterInput) => void;
}

const SERVER_STATUSES = ["RUNNING", "STOPPED", "STARTING", "STOPPING", "ERROR"];

const getStatusColor = (status: string) => {
  switch (status) {
    case "RUNNING":
      return "bg-green-500";
    case "STOPPED":
      return "bg-red-500";
    case "STARTING":
      return "bg-yellow-500";
    case "STOPPING":
      return "bg-orange-500";
    case "ERROR":
      return "bg-red-800";
    default:
      return "bg-gray-400";
  }
};

export function ServerFilters({
  availableGroups,
  onFiltersChange,
}: ServerFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    status: null,
    group: null,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filterInput = useMemo(() => {
    const input: FilterInput = {};
    if (filters.status) input.status = filters.status;
    if (filters.group) input.group = filters.group;
    if (debouncedSearchQuery.trim()) input.search = debouncedSearchQuery.trim();

    return input;
  }, [filters.status, filters.group, debouncedSearchQuery]);

  useEffect(() => {
    onFiltersChange(filterInput);
  }, [filterInput, onFiltersChange]);

  const activeFilterCount = (filters.status ? 1 : 0) + (filters.group ? 1 : 0);

  const toggleFilter = (type: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type] === value ? null : value,
    }));
  };

  const clearAllFilters = () => {
    setFilters({ status: null, group: null });
    setSearchQuery("");
    setDebouncedSearchQuery("");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center gap-4">
        <div className="flex flex-row gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant={filters.status ? "default" : "outline"}
                className="relative"
              >
                <div className="mr-2 h-2 w-2 rounded-full bg-green-500" />
                {filters.status || "Status"}
                <ChevronDownIcon className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              {SERVER_STATUSES.map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => toggleFilter("status", status)}
                  className="flex cursor-pointer items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${getStatusColor(status)}`}
                    />
                    <span className="text-sm">{status}</span>
                  </div>
                  {filters.status === status && (
                    <div className="bg-primary h-2 w-2 rounded-full" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {availableGroups.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant={filters.group ? "default" : "outline"}
                >
                  {filters.group || "Groups"}
                  <ChevronDownIcon className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent>
                {availableGroups.map((group) => (
                  <DropdownMenuItem
                    key={group}
                    onClick={() => toggleFilter("group", group)}
                    className="flex cursor-pointer items-center justify-between"
                  >
                    <span className="text-sm">{group}</span>
                    {filters.group === group && (
                      <div className="bg-primary h-2 w-2 rounded-full" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {activeFilterCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <XIcon className="mr-1 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        <div className="relative max-w-sm flex-1">
          <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search servers..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {(activeFilterCount > 0 || debouncedSearchQuery.trim()) && (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Filters:</span>
          <div className="flex flex-wrap gap-1">
            {filters.status && (
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-1 text-xs"
              >
                <div
                  className={`h-1.5 w-1.5 rounded-full ${getStatusColor(filters.status)}`}
                />

                {filters.status}
                <button
                  className="ml-1 hover:text-destructive transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFilter("status", filters.status!);
                  }}
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {filters.group && (
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-1 text-xs"
              >
                {filters.group}
                <button
                  className="ml-1 hover:text-destructive transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFilter("group", filters.group!);
                  }}
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {debouncedSearchQuery.trim() && (
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-1 text-xs"
              >
                <SearchIcon className="h-3 w-3" />
                {debouncedSearchQuery}
                <button
                  className="ml-1 hover:text-destructive transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchQuery("");
                    setDebouncedSearchQuery("");
                  }}
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
