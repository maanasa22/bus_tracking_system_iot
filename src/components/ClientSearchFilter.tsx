"use client";

import { useState, useMemo, ReactNode } from "react";
import { Search } from "lucide-react";

interface ClientSearchFilterProps {
  items: any[];
  searchKeys: string[];
  placeholder: string;
  filterKey?: string;
  filterOptions?: { label: string; value: string }[];
  children: (filteredItems: any[]) => ReactNode;
}

function getNestedValue(obj: any, path: string): string {
  return path.split(".").reduce((acc, key) => acc?.[key], obj)?.toString()?.toLowerCase() || "";
}

export function ClientSearchFilter({ 
  items, 
  searchKeys, 
  placeholder, 
  filterKey,
  filterOptions,
  children 
}: ClientSearchFilterProps) {
  const [query, setQuery] = useState("");
  const [filterValue, setFilterValue] = useState("ALL");

  const filtered = useMemo(() => {
    let result = items;
    
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(item => 
        searchKeys.some(key => getNestedValue(item, key).includes(q))
      );
    }
    
    if (filterKey && filterValue !== "ALL") {
      result = result.filter(item => getNestedValue(item, filterKey) === filterValue.toLowerCase());
    }
    
    return result;
  }, [items, query, filterValue, searchKeys, filterKey]);

  return (
    <>
      <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="input pl-10 bg-[#111827] border-[#1e293b]"
          />
        </div>
        {filterKey && filterOptions && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select 
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="input bg-[#111827] border-[#1e293b] flex-1 sm:flex-none"
            >
              <option value="ALL">All Statuses</option>
              {filterOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      {children(filtered)}
    </>
  );
}
