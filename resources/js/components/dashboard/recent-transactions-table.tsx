import { ReceiptText } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';

export function RecentTransactionsTable({
    transactions,
}: {
    transactions: { id: number }[];
}) {
    if (transactions.length === 0) {
        return (
            <EmptyState
                icon={ReceiptText}
                title="No transactions yet"
                description="Recent sales will appear here once the POS is in use."
            />
        );
    }

    return null;
}
