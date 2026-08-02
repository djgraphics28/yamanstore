import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export function useNavigationLoading(): boolean {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const removeStart = router.on('start', () => setIsLoading(true));
        const removeFinish = router.on('finish', () => setIsLoading(false));

        return () => {
            removeStart();
            removeFinish();
        };
    }, []);

    return isLoading;
}
