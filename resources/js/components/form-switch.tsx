import { useState } from 'react';
import { Switch } from '@/components/ui/switch';

export function FormSwitch({
    name,
    defaultChecked = false,
}: {
    name: string;
    defaultChecked?: boolean;
}) {
    const [checked, setChecked] = useState(defaultChecked);

    return (
        <>
            <input type="hidden" name={name} value={checked ? '1' : '0'} />
            <Switch checked={checked} onCheckedChange={setChecked} />
        </>
    );
}
