import { DownloadIcon, FileSpreadsheetIcon, UploadCloudIcon, XCircleIcon } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { importMethod, importTemplate } from '@/routes/products';

type ImportError = { row: number; messages: string[] };
type ImportResult = { imported: number; skipped: number; total: number; errors: ImportError[] };
type Phase = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

function getCsrf(): string {
    const m = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : '';
}

function ProgressBar({ percent, phase }: { percent: number; phase: Phase }) {
    const label =
        phase === 'uploading' ? `Uploading… ${percent}%`
        : phase === 'processing' ? 'Processing rows…'
        : phase === 'done' ? 'Complete!'
        : '';

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{label}</span>
                <span>{phase === 'done' ? '100%' : `${percent}%`}</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                    className={[
                        'h-full rounded-full transition-all duration-500',
                        phase === 'done' ? 'bg-emerald-500' : 'bg-primary',
                        phase === 'processing' ? 'animate-pulse' : '',
                    ].join(' ')}
                    style={{ width: `${phase === 'done' ? 100 : percent}%` }}
                />
            </div>
        </div>
    );
}

export function ProductImportDialog({
    open,
    onOpenChange,
    onImported,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onImported?: () => void;
}) {
    const [phase, setPhase] = useState<Phase>('idle');
    const [uploadPct, setUploadPct] = useState(0);
    const [processPct, setProcessPct] = useState(0);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [dragging, setDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    function reset() {
        setPhase('idle');
        setUploadPct(0);
        setProcessPct(0);
        setResult(null);
        setFileError(null);
        setFile(null);
        if (timerRef.current) clearInterval(timerRef.current);
    }

    function handleClose(v: boolean) {
        if (!v && (phase === 'uploading' || phase === 'processing')) return; // block close during upload
        if (!v) reset();
        onOpenChange(v);
    }

    function acceptFile(f: File) {
        if (!f.name.match(/\.(xlsx|xls)$/i)) {
            setFileError('Only .xlsx and .xls files are supported.');
            return;
        }
        if (f.size > 10 * 1024 * 1024) {
            setFileError('File must be under 10 MB.');
            return;
        }
        setFileError(null);
        setFile(f);
    }

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) acceptFile(f);
    }, []);

    function startFakeProcess(from: number) {
        let pct = from;
        timerRef.current = setInterval(() => {
            pct = Math.min(pct + Math.random() * 6 + 1, 94);
            setProcessPct(Math.round(pct));
            if (pct >= 94) clearInterval(timerRef.current!);
        }, 400);
    }

    function handleImport() {
        if (!file) return;

        const fd = new FormData();
        fd.append('file', file);

        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                const pct = Math.round((e.loaded / e.total) * 100);
                setUploadPct(pct);
            }
        };

        xhr.upload.onload = () => {
            setPhase('processing');
            setProcessPct(0);
            startFakeProcess(0);
        };

        xhr.onload = () => {
            if (timerRef.current) clearInterval(timerRef.current);
            setProcessPct(100);

            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const data: ImportResult = JSON.parse(xhr.responseText);
                    setResult(data);
                    setPhase('done');
                    if (data.imported > 0) onImported?.();
                } catch {
                    setPhase('error');
                }
            } else {
                let msg = `Server error (${xhr.status}).`;
                try {
                    const body = JSON.parse(xhr.responseText);
                    if (body?.message) msg = body.message;
                    if (body?.errors?.file) msg = body.errors.file[0];
                } catch { /* noop */ }
                setFileError(msg);
                setPhase('error');
            }
        };

        xhr.onerror = () => {
            if (timerRef.current) clearInterval(timerRef.current);
            setFileError('Network error — please try again.');
            setPhase('error');
        };

        xhr.open('POST', importMethod().url);
        xhr.setRequestHeader('X-XSRF-TOKEN', getCsrf());
        xhr.setRequestHeader('Accept', 'application/json');

        setPhase('uploading');
        setUploadPct(0);
        xhr.send(fd);
    }

    const isWorking = phase === 'uploading' || phase === 'processing';
    const displayPct = phase === 'uploading' ? uploadPct : processPct;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheetIcon className="h-5 w-5 text-emerald-600" />
                        Import Products
                    </DialogTitle>
                    <DialogDescription>
                        Upload an Excel file to bulk-import products. Categories are created automatically if they don't exist.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 pt-1">
                    {/* Template download */}
                    <div className="flex items-center justify-between rounded-lg border border-dashed bg-muted/30 px-4 py-3">
                        <div>
                            <p className="text-sm font-medium">Need the template?</p>
                            <p className="text-xs text-muted-foreground">
                                Includes column instructions, category dropdown, and a sample row.
                            </p>
                        </div>
                        <a
                            href={importTemplate().url}
                            download
                            className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                        >
                            <DownloadIcon className="h-3.5 w-3.5" />
                            Download Template
                        </a>
                    </div>

                    {/* File drop zone — shown in idle / error phases */}
                    {(phase === 'idle' || phase === 'error') && (
                        <div
                            onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={onDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={[
                                'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 transition-colors',
                                dragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30',
                                file ? 'bg-muted/20' : '',
                            ].join(' ')}
                        >
                            <UploadCloudIcon className={`h-8 w-8 ${dragging ? 'text-primary' : 'text-muted-foreground/50'}`} />
                            {file ? (
                                <div className="text-center">
                                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {(file.size / 1024).toFixed(0)} KB · Click to change
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="text-sm font-medium">Drop your Excel file here</p>
                                    <p className="text-xs text-muted-foreground">or click to browse — .xlsx, .xls · max 10 MB</p>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                className="hidden"
                                onChange={(e) => { const f = e.target.files?.[0]; if (f) acceptFile(f); }}
                            />
                        </div>
                    )}

                    {/* File validation error */}
                    {fileError && (
                        <p className="flex items-center gap-1.5 text-sm text-destructive">
                            <XCircleIcon className="h-4 w-4 shrink-0" />
                            {fileError}
                        </p>
                    )}

                    {/* Progress — shown while working */}
                    {isWorking && (
                        <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
                            <ProgressBar percent={displayPct} phase={phase} />
                            <p className="text-center text-xs text-muted-foreground">
                                {phase === 'uploading' ? 'Uploading your file…' : 'Processing rows — please wait…'}
                            </p>
                        </div>
                    )}

                    {/* Results — shown after done */}
                    {phase === 'done' && result && (
                        <div className="space-y-4">
                            <ProgressBar percent={100} phase="done" />

                            <div className="grid grid-cols-3 gap-3">
                                <div className="rounded-lg border bg-emerald-500/10 p-3 text-center">
                                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{result.imported}</p>
                                    <p className="text-xs text-muted-foreground">Imported</p>
                                </div>
                                <div className="rounded-lg border bg-orange-500/10 p-3 text-center">
                                    <p className="text-2xl font-bold text-orange-500">{result.skipped}</p>
                                    <p className="text-xs text-muted-foreground">Skipped</p>
                                </div>
                                <div className="rounded-lg border p-3 text-center">
                                    <p className="text-2xl font-bold">{result.total}</p>
                                    <p className="text-xs text-muted-foreground">Total Rows</p>
                                </div>
                            </div>

                            {result.errors.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-destructive">
                                        {result.errors.length} row{result.errors.length !== 1 ? 's' : ''} had errors:
                                    </p>
                                    <div className="max-h-48 overflow-y-auto rounded-lg border">
                                        <table className="w-full text-xs">
                                            <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                                                <tr>
                                                    <th className="px-3 py-2 text-left font-medium w-16">Row</th>
                                                    <th className="px-3 py-2 text-left font-medium">Issue</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {result.errors.map((err) => (
                                                    <tr key={err.row} className="hover:bg-muted/30">
                                                        <td className="px-3 py-2 font-mono text-muted-foreground">{err.row}</td>
                                                        <td className="px-3 py-2">{err.messages.join(' · ')}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2 pt-1">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={reset}
                                >
                                    Import Another File
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={() => handleClose(false)}
                                >
                                    Done
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Action buttons — idle / error phases only */}
                    {(phase === 'idle' || phase === 'error') && (
                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => handleClose(false)}>
                                Cancel
                            </Button>
                            <Button
                                className="flex-1"
                                disabled={!file || isWorking}
                                onClick={handleImport}
                            >
                                <UploadCloudIcon className="mr-1.5 h-4 w-4" />
                                Import Products
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
