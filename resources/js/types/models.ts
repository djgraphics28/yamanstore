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
    reference_number: string | null;
    user_id: number;
    notes: string | null;
    created_at: string;
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
};

export type GcashRecentTransaction = {
    kind: 'load' | 'gcash';
    id: number;
    label: string;
    network?: LoadNetwork;
    type?: GcashTransactionType;
    amount: number;
    service_fee: number;
    reference_number: string | null;
    notes: string | null;
    user: string;
    created_at: string;
};
