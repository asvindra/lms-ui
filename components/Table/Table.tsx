"use client";

import { useState, useMemo } from "react";
import {
  Table as MUITable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  TablePagination,
  IconButton,
  Box,
} from "@mui/material";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";
import NoData from "../NoData/NoData";

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode; // Optional custom render
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowsPerPageOptions?: number[];
}

export default function Table<T>({
  data,
  columns,
  rowsPerPageOptions = [5, 10, 25],
}: TableProps<T>) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Filter and search logic
  const filteredData = useMemo(() => {
    let result = [...data];

    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) =>
          String(row[col.key]).toLowerCase().includes(lowerSearch)
        )
      );
    }

    if (sortColumn) {
      result.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        return sortDirection === "asc"
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      });
    }

    return result;
  }, [data, search, sortColumn, sortDirection, columns]);

  // Pagination logic
  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const handleSort = (key: keyof T) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(key);
      setSortDirection("asc");
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 2 }}>
      <TextField
        label="Search"
        variant="outlined"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, width: "100%", maxWidth: 300 }}
      />
      <TableContainer component={Paper} sx={{ bgcolor: "grey.100" }}>
        <MUITable>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={String(col.key)}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    {col.label}
                    <IconButton
                      size="small"
                      onClick={() => handleSort(col.key)}
                      sx={{ ml: 1 }}
                    >
                      {sortColumn === col.key ? (
                        sortDirection === "asc" ? (
                          <ArrowUpward fontSize="small" />
                        ) : (
                          <ArrowDownward fontSize="small" />
                        )
                      ) : (
                        <ArrowUpward fontSize="small" color="disabled" />
                      )}
                    </IconButton>
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row: any, index) => (
                <TableRow key={index}>
                  {columns.map((col: any) => (
                    <TableCell key={String(col.key)}>
                      {col.render
                        ? col.render(row[col.key], row)
                        : row[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <NoData message="No data available" />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </MUITable>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
}
