
"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  VisibilityState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  PlusCircle,
  Search,
  Settings2,
} from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  searchColumnId?: string;
  statusColumnId?: string;
  statusOptions?: { label: string; value: string }[];
  onAdd?: () => void;
  addButtonLabel?: string;
  children?: React.ReactNode; // For custom filters or actions area
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Buscar...",
  searchColumnId,
  statusColumnId,
  statusOptions,
  onAdd,
  addButtonLabel = "Añadir",
  children,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full space-y-4">
      {/* Toolbar: Filters and Actions */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        {/* Filters Group (Search, Status, SortBy) */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-center gap-2 w-full lg:w-auto">
          {searchColumnId && (
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={(table.getColumn(searchColumnId)?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn(searchColumnId)?.setFilterValue(event.target.value)
                }
                className="pl-8 w-full sm:min-w-[180px] md:min-w-[220px]"
              />
            </div>
          )}
           {!searchColumnId && ( // Global filter if searchColumnId is not provided
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter ?? ""}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="pl-8 w-full sm:min-w-[180px] md:min-w-[220px]"
              />
            </div>
          )}
          {statusColumnId && statusOptions && (
            <Select
              value={(table.getColumn(statusColumnId)?.getFilterValue() as string) ?? "all"}
              onValueChange={(value) =>
                table.getColumn(statusColumnId)?.setFilterValue(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-full sm:w-auto sm:min-w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {/* Slot for additional filters like SortBy */}
          <div className="w-full sm:w-auto">
            {children}
          </div>
        </div>

        {/* Action Buttons Group (Columnas, Add) */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-center gap-2 w-full lg:w-auto lg:justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Settings2 className="mr-2 h-4 w-4" /> Columnas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          {onAdd && (
            <Button onClick={onAdd} className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> {addButtonLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-md border bg-card w-full sm:w-[600px] md:w-[720px] lg:w-full mx-auto">
        <div className="relative w-full overflow-x-auto"> {/* Ensure horizontal scroll for table */}
            <Table>
            <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                    return (
                        <TableHead key={header.id} className="whitespace-nowrap"> {/* Prevent header text wrapping */}
                        {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                            )}
                        </TableHead>
                    );
                    })}
                </TableRow>
                ))}
            </TableHeader>
            <TableBody>
                {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                    <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    >
                    {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="whitespace-nowrap"> {/* Prevent cell text wrapping */}
                        {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                        )}
                        </TableCell>
                    ))}
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                    >
                    No hay resultados.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-y-4 gap-x-2 py-4">
        <div className="text-sm text-muted-foreground w-full md:w-auto text-center md:text-left">
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} fila(s) seleccionadas.
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-y-4 gap-x-2 w-full md:w-auto">
            <div className="flex items-center space-x-1 xs:space-x-2">
                <Button
                variant="outline"
                size="icon"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="h-8 w-8"
                aria-label="Ir a la primera página"
                >
                <span className="sr-only">Ir a la primera página</span>
                <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                variant="outline"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-8 w-8"
                aria-label="Ir a la página anterior"
                >
                <span className="sr-only">Ir a la página anterior</span>
                <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground px-1 xs:px-2">
                    Pág {table.getState().pagination.pageIndex + 1} de {table.getPageCount() > 0 ? table.getPageCount() : 1}
                </span>
                <Button
                variant="outline"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-8 w-8"
                aria-label="Ir a la página siguiente"
                >
                <span className="sr-only">Ir a la página siguiente</span>
                <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                variant="outline"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="h-8 w-8"
                aria-label="Ir a la última página"
                >
                <span className="sr-only">Ir a la última página</span>
                <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground hidden xs:inline-block">Filas/pág</span>
            <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                    table.setPageSize(Number(value))
                }}
                >
                <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
        </div>
      </div>
    </div>
  );
}
