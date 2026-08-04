import { router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function DateRangePicker({
    dateFrom,
    dateTo,
    url,
}: {
    dateFrom: string;
    dateTo: string;
    url: string;
}) {
    const navigate = (from: string, to: string) => {
        router.get(url, { date_from: from, date_to: to }, { preserveScroll: true, preserveState: true });
    };

    return (
        <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
                <Label htmlFor="date-from" className="text-sm whitespace-nowrap">From</Label>
                <Input
                    id="date-from"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => navigate(e.target.value, dateTo)}
                    className="w-auto"
                />
            </div>
            <div className="flex items-center gap-1.5">
                <Label htmlFor="date-to" className="text-sm whitespace-nowrap">To</Label>
                <Input
                    id="date-to"
                    type="date"
                    value={dateTo}
                    min={dateFrom}
                    onChange={(e) => navigate(dateFrom, e.target.value)}
                    className="w-auto"
                />
            </div>
        </div>
    );
}
