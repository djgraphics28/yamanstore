import { router } from '@inertiajs/react';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
} from '@/components/ui/pagination';
import type { PaginationLink as PaginationLinkType } from '@/types';

export function PaginationBar({ links }: { links: PaginationLinkType[] }) {
    if (links.length <= 3) {
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

    return (
        <Pagination>
            <PaginationContent>
                {links.map((link, index) => {
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
                                isActive={link.active}
                                aria-disabled={!link.url}
                                className={
                                    !link.url
                                        ? 'pointer-events-none opacity-50'
                                        : undefined
                                }
                                onClick={(event) => {
                                    event.preventDefault();
                                    visit(link.url);
                                }}
                                 
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                            />
                        </PaginationItem>
                    );
                })}
            </PaginationContent>
        </Pagination>
    );
}
