import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

const DataTable = ({ columns, data = [], onRowClick, emptyMessage = "No data available" }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      // Reset sort
      setSortConfig({ key: null, direction: 'asc' });
      return;
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      // Handle null/undefined
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      // Handle strings
      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      // Numbers and booleans
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [data, sortConfig]);

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03
      }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 6 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 120, 
        damping: 14 
      } 
    }
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-default bg-card select-none">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-default bg-primary/40">
            {columns.map((col) => {
              const isSorted = sortConfig.key === col.key;
              return (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="table-header-custom p-4 font-medium uppercase tracking-wider text-[11px] text-secondary select-none cursor-pointer group hover:text-primary transition-colors"
                  style={{ width: col.width }}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    <span className="text-muted group-hover:text-secondary transition-colors duration-150">
                      {isSorted ? (
                        sortConfig.direction === 'asc' ? (
                          <ChevronUp size={14} className="text-accent" />
                        ) : (
                          <ChevronDown size={14} className="text-accent" />
                        )
                      ) : (
                        <ChevronsUpDown size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </span>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <motion.tbody
          variants={containerVariants}
          initial="hidden"
          animate="show"
          key={sortedData.length + sortConfig.key + sortConfig.direction} // Re-animate on change
          className="divide-y divide-default"
        >
          {sortedData.length > 0 ? (
            sortedData.map((row, rowIndex) => (
              <motion.tr
                key={row.id || rowIndex}
                variants={rowVariants}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors duration-150 hover:bg-card-hover group ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="p-4 text-sm text-primary font-sans">
                    {col.render ? col.render(row) : (
                      <span className={typeof row[col.key] === 'number' ? 'font-mono' : ''}>
                        {row[col.key] !== undefined && row[col.key] !== null ? String(row[col.key]) : '—'}
                      </span>
                    )}
                  </td>
                ))}
              </motion.tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="p-8 text-center text-sm text-muted font-sans">
                {emptyMessage}
              </td>
            </tr>
          )}
        </motion.tbody>
      </table>
    </div>
  );
};

export default DataTable;
export { DataTable };
