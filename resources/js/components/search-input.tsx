import { SearchIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { cn } from '@/lib/utils';

export function SearchInput({
    initialValue = '',
    placeholder = 'Search…',
    onSearch,
    className,
}: {
    initialValue?: string;
    placeholder?: string;
    onSearch: (value: string) => void;
    className?: string;
}) {
    const [value, setValue] = useState(initialValue);
    const debounced = useDebouncedValue(value, 300);
    const isFirstRun = useRef(true);

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;

            return;
        }

        onSearch(debounced);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debounced]);

    return (
        <div className={cn('relative', className)}>
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                type="search"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder={placeholder}
                className="pl-9"
            />
        </div>
    );
}
