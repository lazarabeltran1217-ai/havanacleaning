"use client";

import { useState, useMemo } from "react";
import { Search, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNestedValue(obj: Record<string, unknown>, path: string): any {
  return path.split(".").reduce((acc: unknown, key) => (acc as Record<string, unknown>)?.[key], obj as unknown);
}

export function useAdminTable<T extends Record<string, unknown>>(
  items: T[],
  config: {
    searchKeys: string[];
    defaultSortKey?: string;
    defaultSortDir?: "asc" | "desc";
  }
) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(
    config.defaultSortKey ?? null
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">(
    config.defaultSortDir ?? "desc"
  );

  const filteredData = useMemo(() => {
    let result = items;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((item) =>
        config.searchKeys.some((key) => {
          const val = getNestedValue(item, key);
          return val != null && String(val).toLowerCase().includes(q);
        })
      );
    }

    // Sort
    if (sortKey) {
      result = [...result].sort((a, b) => {
        const aVal = getNestedValue(a, sortKey);
        const bVal = getNestedValue(b, sortKey);
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;

        let cmp = 0;
        if (typeof aVal === "number" && typeof bVal === "number") {
          cmp = aVal - bVal;
        } else {
          cmp = String(aVal).localeCompare(String(bVal));
        }
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [items, search, sortKey, sortDir, config.searchKeys]);

  const requestSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return { search, setSearch, filteredData, sortKey, sortDir, requestSort };
}

export function TableSearch({
  value,
  onChange,
  placeholder,
  resultCount,
  totalCount,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  resultCount?: number;
  totalCount?: number;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Search..."}
          className="w-full pl-9 pr-3 py-2 text-[0.85rem] bg-white border border-[#ece6d9] rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold placeholder:text-sand/60"
        />
      </div>
      {value && resultCount !== undefined && totalCount !== undefined && (
        <span className="text-[0.78rem] text-sand">
          {resultCount} of {totalCount}
        </span>
      )}
    </div>
  );
}

export function SortHeader({
  label,
  sortKey,
  currentSortKey,
  currentSortDir,
  onSort,
  align,
}: {
  label: string;
  sortKey: string;
  currentSortKey: string | null;
  currentSortDir: "asc" | "desc";
  onSort: (key: string) => void;
  align?: "left" | "right";
}) {
  const isActive = currentSortKey === sortKey;
  return (
    <th
      onClick={() => onSort(sortKey)}
      className={`px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium cursor-pointer select-none hover:text-tobacco transition-colors group ${
        align === "right" ? "text-right" : ""
      }`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive ? (
          currentSortDir === "asc" ? (
            <ArrowUp className="w-3 h-3 text-gold" />
          ) : (
            <ArrowDown className="w-3 h-3 text-gold" />
          )
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />
        )}
      </span>
    </th>
  );
}

// Non-sortable header (for action columns etc.)
export function PlainHeader({
  label,
  align,
}: {
  label?: string;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium ${
        align === "right" ? "text-right" : ""
      }`}
    >
      {label || ""}
    </th>
  );
}
