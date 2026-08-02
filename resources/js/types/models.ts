export type Category = {
    id: number;
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
