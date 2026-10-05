import React from 'react';
import { Block } from '@/types/notion';
import { PlusCircle } from 'lucide-react';

interface TableBlockProps {
  block: Block;
  onUpdate: (updatedBlock: Block) => void;
}

export const TableBlock: React.FC<TableBlockProps> = ({ block, onUpdate }) => {
  const tableData = block.meta?.tableData || [
    ['Column 1', 'Column 2', 'Column 3'],
    ['Item A', '120', 'Done'],
    ['Item B', '340', 'Pending'],
  ];

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newTable = tableData.map((row, rIdx) => {
      if (rIdx === rowIndex) {
        const newRow = [...row];
        newRow[colIndex] = value;
        return newRow;
      }
      return row;
    });

    onUpdate({
      ...block,
      meta: { ...block.meta, tableData: newTable },
    });
  };

  const handleAddRow = () => {
    const colCount = tableData[0]?.length || 2;
    const newRow = new Array(colCount).fill('');
    onUpdate({
      ...block,
      meta: { ...block.meta, tableData: [...tableData, newRow] },
    });
  };

  const handleAddColumn = () => {
    const newTable = tableData.map((row, idx) => [
      ...row,
      idx === 0 ? `Col ${row.length + 1}` : '',
    ]);
    onUpdate({
      ...block,
      meta: { ...block.meta, tableData: newTable },
    });
  };

  return (
    <div className="overflow-x-auto py-1">
      <table className="w-full border-collapse border border-neutral-200 text-xs dark:border-neutral-700">
        <tbody>
          {tableData.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-neutral-200 dark:border-neutral-700">
              {row.map((cell, colIndex) => (
                <td
                  key={colIndex}
                  className={`border-r border-neutral-200 p-2 dark:border-neutral-700 ${
                    rowIndex === 0 ? 'bg-neutral-50 font-medium dark:bg-neutral-800' : ''
                  }`}
                >
                  <input
                    type="text"
                    value={cell}
                    onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                    className="w-full bg-transparent outline-hidden"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center gap-2 mt-2">
        <button
          type="button"
          onClick={handleAddRow}
          className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
        >
          <PlusCircle className="w-3 h-3" />
          <span>Add Row</span>
        </button>
        <button
          type="button"
          onClick={handleAddColumn}
          className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
        >
          <PlusCircle className="w-3 h-3" />
          <span>Add Column</span>
        </button>
      </div>
    </div>
  );
};
