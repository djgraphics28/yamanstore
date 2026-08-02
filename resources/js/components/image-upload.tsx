import { ImageIcon, XIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ImageUpload({
    name,
    initialImageUrl = null,
    className,
}: {
    name: string;
    initialImageUrl?: string | null;
    className?: string;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(initialImageUrl);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setPreview(URL.createObjectURL(file));
    };

    const handleClear = () => {
        setPreview(null);

        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    return (
        <div className={cn('flex items-center gap-4', className)}>
            <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                {preview ? (
                    <img
                        src={preview}
                        alt="Product preview"
                        className="size-full object-cover"
                    />
                ) : (
                    <ImageIcon className="size-8 text-muted-foreground" />
                )}
            </div>

            <div className="flex flex-col gap-2">
                <input
                    ref={inputRef}
                    type="file"
                    name={name}
                    accept="image/*"
                    onChange={handleChange}
                    className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary-foreground"
                />

                {preview && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                        className="w-fit"
                    >
                        <XIcon className="size-3.5" />
                        Remove image
                    </Button>
                )}
            </div>
        </div>
    );
}
