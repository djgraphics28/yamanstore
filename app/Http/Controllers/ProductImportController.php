<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ProductImportController extends Controller
{
    private const COLUMNS = [
        'A' => ['key' => 'name',            'label' => 'Product Name *',   'required' => true,  'note' => 'Required. Full product name.'],
        'B' => ['key' => 'sku',             'label' => 'SKU *',             'required' => true,  'note' => 'Required. Must be unique across all products. Rows with duplicate SKUs will be skipped.'],
        'C' => ['key' => 'barcode',         'label' => 'Barcode',           'required' => false, 'note' => 'Optional. Product barcode / QR code value.'],
        'D' => ['key' => 'category',        'label' => 'Category *',        'required' => true,  'note' => 'Required. Select from dropdown or type. For subcategories use: Parent / Sub format (e.g. "Food / Snacks"). New categories are created automatically.'],
        'E' => ['key' => 'brand',           'label' => 'Brand',             'required' => false, 'note' => 'Optional.'],
        'F' => ['key' => 'cost_price',      'label' => 'Cost Price *',      'required' => true,  'note' => 'Required. Numeric value (e.g. 50 or 50.00).'],
        'G' => ['key' => 'selling_price',   'label' => 'Selling Price *',   'required' => true,  'note' => 'Required. Numeric value.'],
        'H' => ['key' => 'unit',            'label' => 'Unit *',            'required' => true,  'note' => 'Required. e.g. pcs, kg, box, bottle, pack, liter.'],
        'I' => ['key' => 'current_stock',   'label' => 'Current Stock',     'required' => false, 'note' => 'Optional. Integer. Defaults to 0.'],
        'J' => ['key' => 'minimum_stock',   'label' => 'Minimum Stock',     'required' => false, 'note' => 'Optional. Integer. Alert threshold. Defaults to 0.'],
        'K' => ['key' => 'expiration_date', 'label' => 'Expiration Date',   'required' => false, 'note' => 'Optional. Format: YYYY-MM-DD (e.g. 2027-12-31).'],
        'L' => ['key' => 'status',          'label' => 'Status',            'required' => false, 'note' => 'Optional. "active" or "inactive". Defaults to active.'],
    ];

    public function template(Request $request): StreamedResponse
    {
        abort_unless($request->user()?->can('products.create'), 403);

        $categories = Category::with('parent')
            ->orderByRaw('CASE WHEN parent_id IS NULL THEN 0 ELSE 1 END')
            ->orderBy('parent_id')
            ->orderBy('name')
            ->get()
            ->map(fn (Category $c) => $c->parent ? "{$c->parent->name} / {$c->name}" : $c->name)
            ->values()
            ->toArray();

        $spreadsheet = new Spreadsheet();
        $green       = '166534';
        $lightGreen  = 'BBFFD8';
        $white       = 'FFFFFF';

        // ── Sheet 1: Instructions ─────────────────────────────────────────────
        $inst = $spreadsheet->getActiveSheet()->setTitle('Instructions');

        $inst->mergeCells('A1:E1');
        $inst->setCellValue('A1', 'YamanStore — Product Import Template');
        $inst->getStyle('A1')->applyFromArray([
            'font'      => ['bold' => true, 'size' => 14, 'color' => ['argb' => 'FF' . $green]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT],
        ]);
        $inst->getRowDimension(1)->setRowHeight(24);

        $inst->mergeCells('A2:E2');
        $inst->setCellValue('A2', 'Switch to the "Products" sheet to enter your data. Delete the sample row before importing.');
        $inst->getStyle('A2')->applyFromArray([
            'font' => ['italic' => true, 'color' => ['argb' => 'FF555555']],
        ]);

        // Header row for column guide
        foreach (['A' => 'Col', 'B' => 'Field', 'C' => 'Required', 'D' => 'Notes'] as $col => $title) {
            $inst->setCellValue("{$col}4", $title);
        }
        $inst->getStyle('A4:D4')->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['argb' => 'FF' . $white]],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'color' => ['argb' => 'FF' . $green]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);

        $row = 5;
        foreach (self::COLUMNS as $colLetter => $def) {
            $inst->setCellValue("A{$row}", $colLetter);
            $inst->setCellValue("B{$row}", $def['label']);
            $inst->setCellValue("C{$row}", $def['required'] ? 'Yes' : 'No');
            $inst->setCellValue("D{$row}", $def['note']);
            $inst->getStyle("D{$row}")->getAlignment()->setWrapText(true);

            if ($row % 2 === 0) {
                $inst->getStyle("A{$row}:D{$row}")->getFill()
                    ->setFillType(Fill::FILL_SOLID)
                    ->getStartColor()->setARGB('FFF0FFF4');
            }

            $row++;
        }

        $inst->setCellValue("A{$row}", '');
        $row++;
        $inst->mergeCells("A{$row}:D{$row}");
        $inst->setCellValue("A{$row}", 'IMPORTANT NOTES');
        $inst->getStyle("A{$row}")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['argb' => 'FF' . $green]],
        ]);
        $row++;

        $notes = [
            '1. Rows with errors (missing required fields, duplicate SKU) are skipped — the rest are still imported.',
            '2. If a category does not exist it will be created automatically. Use "Parent / Sub" (e.g. Food / Snacks) for sub-categories.',
            '3. The Category dropdown shows existing categories. You can also type a new name and it will be created.',
            '4. Dates must be in YYYY-MM-DD format (e.g. 2027-12-31).',
            '5. Maximum file size: 10 MB.',
        ];

        foreach ($notes as $note) {
            $inst->mergeCells("A{$row}:D{$row}");
            $inst->setCellValue("A{$row}", $note);
            $inst->getStyle("A{$row}")->getAlignment()->setWrapText(true);
            $row++;
        }

        $inst->getColumnDimension('A')->setWidth(8);
        $inst->getColumnDimension('B')->setWidth(22);
        $inst->getColumnDimension('C')->setWidth(12);
        $inst->getColumnDimension('D')->setWidth(72);
        $inst->getRowDimension(2)->setRowHeight(18);
        for ($r = 5; $r <= $row; $r++) {
            $inst->getRowDimension($r)->setRowHeight(-1); // auto
        }

        // ── Sheet 2: CategoryList (hidden — powers the dropdown) ──────────────
        $catSheet = $spreadsheet->createSheet()->setTitle('CategoryList');
        $catSheet->setSheetState(Worksheet::SHEETSTATE_HIDDEN);

        if (empty($categories)) {
            $categories = ['General'];
        }

        foreach ($categories as $i => $name) {
            $catSheet->setCellValue('A' . ($i + 1), $name);
        }

        $catCount = count($categories);

        // ── Sheet 3: Products (data entry) ────────────────────────────────────
        $prod = $spreadsheet->createSheet()->setTitle('Products');

        // Header row
        foreach (self::COLUMNS as $colLetter => $def) {
            $prod->setCellValue("{$colLetter}1", $def['label']);
        }

        $prod->getStyle('A1:L1')->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['argb' => 'FF' . $white], 'size' => 10],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'color' => ['argb' => 'FF' . $green]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $prod->getRowDimension(1)->setRowHeight(22);

        // Sample row (styled so users can tell it apart)
        $sampleCategory = $categories[0] ?? 'General';
        $prod->setCellValue('A2', 'Sample Product Name');
        $prod->setCellValue('B2', 'SKU-SAMPLE-001');
        $prod->setCellValue('C2', '');
        $prod->setCellValue('D2', $sampleCategory);
        $prod->setCellValue('E2', 'Brand Name');
        $prod->setCellValue('F2', 50.00);
        $prod->setCellValue('G2', 80.00);
        $prod->setCellValue('H2', 'pcs');
        $prod->setCellValue('I2', 100);
        $prod->setCellValue('J2', 10);
        $prod->setCellValue('K2', '');
        $prod->setCellValue('L2', 'active');

        $prod->getStyle('A2:L2')->applyFromArray([
            'font'      => ['italic' => true, 'color' => ['argb' => 'FF' . $green]],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'color' => ['argb' => 'FF' . $lightGreen]],
        ]);

        // Column widths
        foreach ([
            'A' => 28, 'B' => 18, 'C' => 16, 'D' => 32, 'E' => 20,
            'F' => 14, 'G' => 16, 'H' => 12, 'I' => 15, 'J' => 16,
            'K' => 18, 'L' => 12,
        ] as $letter => $width) {
            $prod->getColumnDimension($letter)->setWidth($width);
        }

        // Freeze pane below header
        $prod->freezePane('A2');

        // Data validation — Category column (D): dropdown from CategoryList sheet
        $catFormula = "=CategoryList!\$A\$1:\$A\${$catCount}";
        for ($r = 2; $r <= 2001; $r++) {
            $v = $prod->getCell("D{$r}")->getDataValidation();
            $v->setType(DataValidation::TYPE_LIST);
            $v->setErrorStyle(DataValidation::STYLE_WARNING);
            $v->setAllowBlank(false);
            $v->setShowInputMessage(true);
            $v->setShowDropDown(true);
            $v->setShowErrorMessage(true);
            $v->setErrorTitle('Invalid category');
            $v->setError('Select from the dropdown or type a new category name.');
            $v->setPromptTitle('Category');
            $v->setPrompt('Choose an existing category or type a new one. For subcategories: Parent / Sub');
            $v->setFormula1($catFormula);
        }

        // Data validation — Status column (L)
        for ($r = 2; $r <= 2001; $r++) {
            $v = $prod->getCell("L{$r}")->getDataValidation();
            $v->setType(DataValidation::TYPE_LIST);
            $v->setErrorStyle(DataValidation::STYLE_STOP);
            $v->setAllowBlank(true);
            $v->setShowDropDown(true);
            $v->setFormula1('"active,inactive"');
        }

        // Make the Products sheet the active one
        $spreadsheet->setActiveSheetIndex(2);

        $writer = new Xlsx($spreadsheet);
        $writer->setPreCalculateFormulas(false);

        return response()->streamDownload(
            fn () => $writer->save('php://output'),
            'product-import-template.xlsx',
            [
                'Content-Type'        => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => 'attachment; filename="product-import-template.xlsx"',
                'Cache-Control'       => 'max-age=0',
            ],
        );
    }

    public function import(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('products.create'), 403);

        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls', 'max:10240'],
        ]);

        $file   = $request->file('file');
        $reader = \PhpOffice\PhpSpreadsheet\IOFactory::createReaderForFile($file->getPathname());
        $reader->setReadDataOnly(true);
        $spreadsheet = $reader->load($file->getPathname());

        // Prefer sheet named "Products", fall back to active sheet
        $sheet = null;
        foreach ($spreadsheet->getAllSheets() as $s) {
            if (strtolower($s->getTitle()) === 'products') {
                $sheet = $s;
                break;
            }
        }
        $sheet ??= $spreadsheet->getActiveSheet();

        $rows = $sheet->toArray(null, true, true, false);

        if (empty($rows)) {
            return response()->json(['imported' => 0, 'skipped' => 0, 'total' => 0, 'errors' => []]);
        }

        // Skip header row
        $dataRows = array_slice($rows, 1);

        $imported      = 0;
        $skipped       = 0;
        $errors        = [];
        $total         = 0;
        $categoryCache = [];

        // Pre-load existing SKUs (including soft-deleted) to detect duplicates
        $existingSkus = Product::withTrashed()
            ->pluck('sku')
            ->mapWithKeys(fn ($s) => [strtolower(trim((string) $s)) => true])
            ->all();

        foreach ($dataRows as $index => $row) {
            $rowNum  = $index + 2;
            $trimmed = array_map(fn ($v) => trim((string) $v), $row);

            if (empty(array_filter($trimmed))) {
                continue; // blank row
            }

            $total++;

            [
                $name,
                $sku,
                $barcode,
                $category,
                $brand,
                $costPrice,
                $sellingPrice,
                $unit,
                $currentStock,
                $minimumStock,
                $expirationDate,
                $status,
            ] = array_pad($trimmed, 12, '');

            $rowErrors = [];

            if ($name === '')        $rowErrors[] = 'Product Name is required';
            if ($sku === '')         $rowErrors[] = 'SKU is required';
            if ($category === '')    $rowErrors[] = 'Category is required';
            if ($costPrice === '')   $rowErrors[] = 'Cost Price is required';
            if (!is_numeric($costPrice) && $costPrice !== '') $rowErrors[] = 'Cost Price must be a number';
            if ($sellingPrice === '') $rowErrors[] = 'Selling Price is required';
            if (!is_numeric($sellingPrice) && $sellingPrice !== '') $rowErrors[] = 'Selling Price must be a number';
            if ($unit === '')         $rowErrors[] = 'Unit is required';

            if (!empty($rowErrors)) {
                $errors[] = ['row' => $rowNum, 'messages' => $rowErrors];
                $skipped++;
                continue;
            }

            $skuNorm = strtolower(trim($sku));
            if (isset($existingSkus[$skuNorm])) {
                $errors[] = ['row' => $rowNum, 'messages' => ["SKU \"{$sku}\" already exists — row skipped."]];
                $skipped++;
                continue;
            }

            $categoryId = $this->resolveCategory(trim($category), $categoryCache);

            if (! $categoryId) {
                $errors[] = ['row' => $rowNum, 'messages' => ["Could not create category \"{$category}\"."]];
                $skipped++;
                continue;
            }

            $currentStockVal   = is_numeric($currentStock)   ? (int) $currentStock   : 0;
            $minimumStockVal   = is_numeric($minimumStock)   ? (int) $minimumStock   : 0;
            $expirationDateVal = $expirationDate !== '' ? $this->parseDate($expirationDate) : null;
            $statusVal         = in_array(strtolower($status), ['active', 'inactive'], true)
                ? strtolower($status)
                : 'active';

            try {
                DB::transaction(function () use (
                    $name, $sku, $barcode, $categoryId, $brand,
                    $costPrice, $sellingPrice, $unit,
                    $currentStockVal, $minimumStockVal, $expirationDateVal, $statusVal,
                ): void {
                    Product::create([
                        'name'            => $name,
                        'sku'             => strtoupper(trim($sku)),
                        'barcode'         => $barcode !== '' ? $barcode : null,
                        'category_id'     => $categoryId,
                        'brand'           => $brand !== '' ? $brand : null,
                        'cost_price'      => (float) $costPrice,
                        'selling_price'   => (float) $sellingPrice,
                        'unit'            => $unit,
                        'current_stock'   => $currentStockVal,
                        'minimum_stock'   => $minimumStockVal,
                        'expiration_date' => $expirationDateVal,
                        'status'          => $statusVal,
                    ]);
                });

                $existingSkus[$skuNorm] = true;
                $imported++;
            } catch (\Exception $e) {
                $errors[] = ['row' => $rowNum, 'messages' => ['Save failed: ' . $e->getMessage()]];
                $skipped++;
            }
        }

        return response()->json([
            'imported' => $imported,
            'skipped'  => $skipped,
            'total'    => $total,
            'errors'   => $errors,
        ]);
    }

    /** @param array<string, int> $cache */
    private function resolveCategory(string $name, array &$cache): ?int
    {
        $key = strtolower($name);

        if (isset($cache[$key])) {
            return $cache[$key];
        }

        // "Parent / Sub" format
        if (str_contains($name, '/')) {
            [$parentName, $childName] = array_map('trim', explode('/', $name, 2));

            $parentId = $this->resolveCategory($parentName, $cache);
            if (! $parentId) {
                return null;
            }

            try {
                $child = Category::where('name', $childName)->first()
                    ?? Category::create([
                        'name'      => $childName,
                        'parent_id' => $parentId,
                        'slug'      => $this->uniqueSlug($childName),
                        'is_active' => true,
                    ]);

                $cache[$key] = $child->id;
                return $child->id;
            } catch (\Exception) {
                return null;
            }
        }

        try {
            $category = Category::where('name', $name)->first()
                ?? Category::create([
                    'name'      => $name,
                    'parent_id' => null,
                    'slug'      => $this->uniqueSlug($name),
                    'is_active' => true,
                ]);

            $cache[$key] = $category->id;
            return $category->id;
        } catch (\Exception) {
            return null;
        }
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'category';
        $slug = $base;
        $n    = 2;

        while (Category::withTrashed()->where('slug', $slug)->exists()) {
            $slug = "{$base}-{$n}";
            $n++;
        }

        return $slug;
    }

    private function parseDate(string $value): ?string
    {
        try {
            if (is_numeric($value)) {
                return \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject((float) $value)
                    ->format('Y-m-d');
            }

            return \Illuminate\Support\Carbon::parse($value)->format('Y-m-d');
        } catch (\Exception) {
            return null;
        }
    }
}
