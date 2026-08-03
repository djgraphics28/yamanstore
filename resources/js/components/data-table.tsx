import {
    
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    
    
    
    useReactTable
    
} from '@tanstack/react-table';
import type {ColumnDef, OnChangeFn, RowSelectionState, SortingState, VisibilityState} from '@tanstack/react-table';
import { useState } from 'react';
import { DataTableViewOptions } from '@/components/data-table-view-options';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export type { ColumnDef };

function columnClassName<TData>(
    columnDef: ColumnDef<TData, unknown>,
): string | undefined {
    return (columnDef.meta as { className?: string } | undefined)?.className;
}

function selectionColumn<TData>(): ColumnDef<TData, unknown> {
    return {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                onClick={(event) => event.stopPropagation()}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: { className: 'w-10' },
    };
}

export function DataTable<TData extends { id: number | string }>({
    data,
    columns,
    renderMobileCard,
    rowSelection,
    onRowSelectionChange,
}: {
    data: TData[];
    columns: ColumnDef<TData, unknown>[];
    renderMobileCard: (row: TData) => React.ReactNode;
    rowSelection?: RowSelectionState;
    onRowSelectionChange?: OnChangeFn<RowSelectionState>;
}) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
        {},
    );

    const enableRowSelection = onRowSelectionChange !== undefined;
    const allColumns = enableRowSelection
        ? [selectionColumn<TData>(), ...columns]
        : columns;

    const table = useReactTable({
        data,
        columns: allColumns,
        state: { sorting, columnVisibility, rowSelection: rowSelection ?? {} },
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange,
        enableRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getRowId: (row) => String(row.id),
    });

    return (
        <>
            <div className="flex justify-end">
                <DataTableViewOptions table={table} />
            </div>

            <div className="hidden overflow-hidden rounded-lg border sm:block">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className={cn(
                                            columnClassName(
                                                header.column.columnDef,
                                            ),
                                        )}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext(),
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={
                                    row.getIsSelected() ? 'selected' : undefined
                                }
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell
                                        key={cell.id}
                                        className={cn(
                                            columnClassName(
                                                cell.column.columnDef,
                                            ),
                                        )}
                                    >
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext(),
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-col gap-3 sm:hidden">
                {data.map((row) => (
                    <div key={row.id}>{renderMobileCard(row)}</div>
                ))}
            </div>
        </>
    );
}
