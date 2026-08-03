import { router } from '@inertiajs/react';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { PaginationLink as PaginationLinkType } from '@/types';

const PER_PAGE_OPTIONS = [10, 15, 25, 50, 100];

export type PaginationMeta = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

export function PaginationBar({
    links,
    meta,
    onPerPageChange,
}: {
    links: PaginationLinkType[];
    meta?: PaginationMeta;
    onPerPageChange?: (perPage: number) => void;
}) {
    const showLinks = links.length > 3;

    if (!showLinks && !onPerPageChange) {
        return null;
    }

    const visit = (url: string | null) => {
        if (!url) {
            return;
        }

        router.get(
            url,
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const disabledClassName = (url: string | null) =>
        !url ? 'pointer-events-none opacity-50' : undefined;

    const [previousLink, ...rest] = links;
    const nextLink = showLinks ? rest.pop() : undefined;
    const pageLinks = rest;

    return (
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-4">
                {meta && (
                    <p className="text-sm text-muted-foreground">
                        {meta.total === 0
                            ? 'No results'
                            : `${meta.from}–${meta.to} of ${meta.total}`}
                    </p>
                )}

                {onPerPageChange && (
                    <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">
                            Rows per page
                        </p>
                        <Select
                            value={String(meta?.per_page ?? 15)}
                            onValueChange={(value) =>
                                onPerPageChange(Number(value))
                            }
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {PER_PAGE_OPTIONS.map((size) => (
                                    <SelectItem
                                        key={size}
                                        value={String(size)}
                                    >
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            {showLinks && (
                <Pagination className="mx-0 w-fit">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                aria-disabled={!previousLink.url}
                                className={disabledClassName(
                                    previousLink.url,
                                )}
                                onClick={(event) => {
                                    event.preventDefault();
                                    visit(previousLink.url);
                                }}
                            />
                        </PaginationItem>

                        {pageLinks.map((link, index) => {
                            if (link.label.includes('...')) {
                                return (
                                    <PaginationItem key={index}>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                );
                            }

                            return (
                                <PaginationItem key={index}>
                                    <PaginationLink
                                        href="#"
                                        isActive={link.active}
                                        onClick={(event) => {
                                            event.preventDefault();
                                            visit(link.url);
                                        }}
                                    >
                                        {link.label}
                                    </PaginationLink>
                                </PaginationItem>
                            );
                        })}

                        {nextLink && (
                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    aria-disabled={!nextLink.url}
                                    className={disabledClassName(
                                        nextLink.url,
                                    )}
                                    onClick={(event) => {
                                        event.preventDefault();
                                        visit(nextLink.url);
                                    }}
                                />
                            </PaginationItem>
                        )}
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
}
