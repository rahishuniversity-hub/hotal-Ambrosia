"use client";

import type { ReactNode } from "react";

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

export default function DataTable<T extends { id?: string }>({
  columns,
  data,
  emptyMessage = "No records found.",
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-cream p-12 text-center">
        <p className="text-sm text-warm-gray">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-cream overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-cream bg-cream/50">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className="text-left px-4 py-3 text-xs font-semibold text-warm-gray uppercase tracking-wider"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, rowIndex) => (
              <tr
                key={item.id ?? rowIndex}
                className="border-b border-cream/50 hover:bg-cream/30 transition-colors"
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-4 py-3 text-sm text-charcoal">
                    {typeof col.accessor === "function"
                      ? col.accessor(item)
                      : (item[col.accessor] as ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
