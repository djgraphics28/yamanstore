export type Category = {
    id: number;
    parent_id: number | null;
    parent?: { id: number; name: string } | null;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    products_count?: number;
    created_at: string;
    updated_at: string;
};

export type Supplier = {
    id: number;
    name: string;
    contact_person: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type ProductStatus = 'active' | 'inactive';

export type SupplierPrice = {
    id: number;
    supplier_id: number;
    supplier?: Supplier;
    cost_price: string;
    is_preferred: boolean;
};

export type Product = {
    id: number;
    name: string;
    sku: string;
    barcode: string | null;
    category_id: number;
    category?: Category;
    brand: string | null;
    supplier_id: number | null;
    supplier?: Supplier;
    supplier_prices?: SupplierPrice[];
    cost_price: string;
    selling_price: string;
    unit: string;
    current_stock: number;
    minimum_stock: number;
    expiration_date: string | null;
    image_path: string | null;
    image_url: string | null;
    status: ProductStatus;
    created_at: string;
    updated_at: string;
};

export type ProductVariant = {
    id: number;
    product_id: number;
    name: string;
    sku: string | null;
    price_override: string | null;
    stock_override: number | null;
    is_active: boolean;
};

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type Paginated<T> = {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

export type LoadNetwork = 'globe' | 'smart' | 'tnt' | 'dito' | 'tm';

export type GcashTransactionType = 'cash_in' | 'cash_out';

export type LoadTransaction = {
    id: number;
    network: LoadNetwork;
    amount: number;
    service_fee: number;
    reference_number: string | null;
    user_id: number;
    notes: string | null;
    created_at: string;
};

export type GcashTransaction = {
    id: number;
    type: GcashTransactionType;
    amount: number;
    service_fee: number;
    fee_in_gcash: boolean;
    reference_number: string | null;
    user_id: number;
    notes: string | null;
    created_at: string;
};

export type PrintServiceType = 'mono' | 'color' | 'photo' | 'scan' | 'photocopy';
export type PrintPaperSize = 'short' | 'a4' | 'long' | 'photo_full' | 'photo_half';

export type PrintTransaction = {
    id: number;
    service_type: PrintServiceType;
    paper_size: PrintPaperSize;
    pages: number;
    unit_price: number;
    total_amount: number;
    notes: string | null;
    user_id: number;
    created_at: string;
};

export type PrintSummary = {
    revenue: number;
    count: number;
    pages: number;
};

export type PrintRecentTransaction = {
    id: number;
    service_type: PrintServiceType;
    service_label: string;
    paper_size: PrintPaperSize;
    paper_label: string;
    pages: number;
    unit_price: number;
    total_amount: number;
    notes: string | null;
    user: string;
    created_at: string;
};

export type PrintServiceOption = {
    value: PrintServiceType;
    label: string;
    sizes: { value: PrintPaperSize; label: string; price: number }[];
};

export type UserRole = 'Administrator' | 'Manager' | 'Cashier' | 'Inventory Staff';

export type UserRecord = {
    id: number;
    name: string;
    email: string;
    role: UserRole | null;
    created_at: string;
};

export type EditableUser = {
    id: number;
    name: string;
    email: string;
    role: UserRole | null;
};

export type GcashPeriodStats = {
    count: number;
    amount: number;
    fees: number;
};

export type GcashSummary = {
    load: GcashPeriodStats;
    cashIn: GcashPeriodStats;
    cashOut: GcashPeriodStats;
    cashOnHand: number;
    gcashBalance: number;
    openingCashOnHand: number;
    openingGcashBalance: number;
};

export type GcashOpeningBalance = {
    id: number;
    date: string;
    cash_on_hand: number;
    gcash_balance: number;
    notes: string | null;
};

export type GcashRecentTransaction = {
    kind: 'load' | 'gcash';
    id: number;
    label: string;
    network?: LoadNetwork;
    type?: GcashTransactionType;
    fee_in_gcash?: boolean;
    amount: number;
    service_fee: number;
    reference_number: string | null;
    notes: string | null;
    user: string;
    created_at: string;
};

export type SaleItem = {
    product_name: string;
    product_sku: string;
    unit_price: number;
    quantity: number;
    discount: number;
    subtotal: number;
};

export type Sale = {
    id: number;
    reference_number: string;
    cashier: string;
    subtotal: number;
    discount: number;
    total: number;
    amount_tendered: number;
    change_due: number;
    payment_method: 'cash' | 'gcash';
    status: 'completed' | 'voided';
    voided_at: string | null;
    voided_by: string | null;
    void_reason: string | null;
    notes: string | null;
    items: SaleItem[];
    created_at: string;
};

export type PosProduct = {
    id: number;
    name: string;
    sku: string;
    barcode: string | null;
    selling_price: number;
    current_stock: number;
    category_id: number;
    category: string | null;
    image_url: string | null;
};

export type PosCategory = {
    id: number;
    name: string;
};

export type CartItem = {
    product_id: number;
    name: string;
    sku: string;
    unit_price: number;
    quantity: number;
    discount: number;
};
