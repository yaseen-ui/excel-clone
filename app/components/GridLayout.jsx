"use client";

import { useState, useEffect, useCallback } from "react";
import { Grid } from "react-virtualized";
import "react-virtualized/styles.css";

const rowCount = process.env.NEXT_PUBLIC_ROW_COUNT
  ? parseInt(process.env.NEXT_PUBLIC_ROW_COUNT)
  : 100;
const columnCount = process.env.NEXT_PUBLIC_COLUMN_COUNT
  ? parseInt(process.env.NEXT_PUBLIC_COLUMN_COUNT)
  : 100;

const cellHeight = 35;
const cellWidth = 100;

// Convert column index to Excel-style column labels (A, B, C...Z, AA, AB...)
const getColumnLabel = (index) => {
  let label = "";
  while (index >= 0) {
    label = String.fromCharCode((index % 26) + 65) + label;
    index = Math.floor(index / 26) - 1;
  }
  return label;
};

// Convert Excel-like cell reference (A1, B2) to row/col index, skipping headers
const parseCellReference = (cellRef) => {
  const match = cellRef.match(/([A-Z]+)([0-9]+)/);
  if (!match) return null;

  const colLabel = match[1];
  const rowIndex = parseInt(match[2], 10) - 1;

  let columnIndex = 0;
  for (let i = 0; i < colLabel.length; i++) {
    columnIndex = columnIndex * 26 + (colLabel.charCodeAt(i) - 65 + 1);
  }
  columnIndex -= 1;

  if (rowIndex < 0 || columnIndex < 0) return null;

  return { row: rowIndex + 1, col: columnIndex + 1 };
};

// Evaluates a formula and replaces cell references with their values
const evaluateFormula = (formula, cellData, seen = new Set()) => {
  if (!formula.startsWith("="))
    return isNaN(formula) ? formula : parseFloat(formula);

  let expression = formula.substring(1).replace(/[A-Z]+[0-9]+/g, (match) => {
    const cellRef = parseCellReference(match);
    if (!cellRef) return "0";

    const key = `${cellRef.row}:${cellRef.col}`;
    if (seen.has(key)) return "0"; // Prevent circular references
    seen.add(key);

    return cellData[key]?.value || 0; // Directly use computed value
  });

  try {
    return new Function(`return ${expression}`)();
  } catch (error) {
    return "Error";
  }
};

export default function VirtualizedGrid() {
  const [windowSize, setWindowSize] = useState({ width: 800, height: 500 });
  const [cellData, setCellData] = useState({});
  const [editingCell, setEditingCell] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [historyCell, setHistoryCell] = useState(null);
  const currentUser = "User1"; // Simulated user tracking

  useEffect(() => {
    setWindowSize({
      width: typeof window !== "undefined" ? window.innerWidth : 800,
      height: typeof window !== "undefined" ? window.innerHeight : 500,
    });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Function to update only affected formula cells
  const updateDependentCells = (updatedData, modifiedKey) => {
    let newData = { ...updatedData };

    Object.keys(newData).forEach((key) => {
      if (newData[key].formula?.includes(modifiedKey)) {
        newData[key].value = evaluateFormula(newData[key].formula, newData);
      }
    });

    return newData;
  };

  const commitCellValue = () => {
    if (editingCell) {
      const { row, col } = editingCell;
      const key = `${row}:${col}`;
      setCellData((prev) => {
        let newData = { ...prev };

        const prevValue = newData[key]?.value || "";
        const newFormula = inputValue;
        const newValue = evaluateFormula(newFormula, newData);
        const timestamp = Date.now();

        newData[key] = {
          formula: newFormula,
          value: newValue,
          lastModified: timestamp,
          author: currentUser,
          previousValues: [
            ...(newData[key]?.previousValues || []),
            { value: prevValue, modifiedAt: timestamp, author: currentUser },
          ].slice(-5),
        };

        return updateDependentCells(newData, key);
      });

      setEditingCell(null);
    }
  };

  const handleKeyNavigation = (e, rowIndex, columnIndex) => {
    if (e.key === "Enter") {
      commitCellValue();
      setEditingCell({ row: rowIndex + 1, col: columnIndex });
      setInputValue(cellData[`${rowIndex + 1}:${columnIndex}`]?.formula || "");
      e.preventDefault();
    }
    if (e.key === "Tab") {
      commitCellValue();
      setEditingCell({ row: rowIndex, col: columnIndex + 1 });
      setInputValue(cellData[`${rowIndex}:${columnIndex + 1}`]?.formula || "");
      e.preventDefault();
    }
  };

  const cellRenderer = useCallback(
    ({ columnIndex, key, rowIndex, style }) => {
      const isHeaderRow = rowIndex === 0;
      const isHeaderColumn = columnIndex === 0;
      const isEditing =
        editingCell?.row === rowIndex && editingCell?.col === columnIndex;
      const cellKey = `${rowIndex}:${columnIndex}`;
      const cell = cellData[cellKey] || {
        formula: "",
        value: "",
        lastModified: "",
        previousValues: [],
      };

      const cellValue = cell.formula.startsWith("=")
        ? cell.value
        : cell.formula;

      return (
        <div
          key={key}
          className={`relative flex items-center justify-center border border-gray-300 text-center ${
            isHeaderRow || isHeaderColumn ? "bg-gray-200 font-bold" : "bg-white"
          } ${isEditing ? "outline outline-2 outline-blue-500" : ""}`}
          style={{ ...style, padding: "5px", cursor: "pointer" }}
          onClick={() => {
            if (!isHeaderRow && !isHeaderColumn) {
              commitCellValue();
              setEditingCell({ row: rowIndex, col: columnIndex });
              setInputValue(cell.formula);
            }
          }}
          onDoubleClick={() => {
            if (!isHeaderRow && !isHeaderColumn) {
              setHistoryCell({ row: rowIndex, col: columnIndex });
            }
          }}
        >
          {isEditing ? (
            <input
              autoFocus
              className="w-full h-full border-none outline-none text-center"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={commitCellValue}
              onKeyDown={(e) => handleKeyNavigation(e, rowIndex, columnIndex)}
            />
          ) : isHeaderRow ? (
            getColumnLabel(columnIndex - 1)
          ) : isHeaderColumn ? (
            rowIndex
          ) : (
            cellValue
          )}

          {/* History Popup */}
          {historyCell?.row === rowIndex &&
            historyCell?.col === columnIndex && (
              <div className="absolute top-10 left-0 bg-white border border-gray-400 shadow-md p-2 text-xs rounded-lg w-48 z-50">
                <div className="font-bold mb-1">Edit History</div>
                {cell.previousValues.length > 0 ? (
                  cell.previousValues.map((entry, index) => (
                    <div key={index} className="border-b py-1">
                      <span>Value:</span> {entry.value} <br />
                      <span>By:</span> {entry.author} <br />
                      <span>At:</span>{" "}
                      {new Date(entry.modifiedAt).toLocaleTimeString()}
                    </div>
                  ))
                ) : (
                  <div>No history available</div>
                )}
                <button
                  className="mt-2 w-full bg-gray-300 text-black py-1 rounded"
                  onClick={() => setHistoryCell(null)}
                >
                  Close
                </button>
              </div>
            )}
        </div>
      );
    },
    [editingCell, inputValue, cellData, historyCell]
  );

  return (
    <Grid
      cellRenderer={cellRenderer}
      columnCount={columnCount}
      columnWidth={cellWidth}
      height={windowSize.height}
      rowCount={rowCount}
      rowHeight={cellHeight}
      width={windowSize.width}
    />
  );
}
