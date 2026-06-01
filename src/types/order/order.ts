export type OrderStatus = string;

export interface OrderPartySummary {
    id?: string;
    fullName?: string;
    phone?: string;
    email?: string;
    avatar?: string | null;
    role?: string;
}

export interface OrderPriceAdjustmentResponse {
    id?: string;
    status?: string;
    beforePrice?: number;
    afterPrice?: number;
    amount?: number;
    reason?: string;
    note?: string;
    requestedBy?: string;
    reviewedBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface OrderResponse {
    id: string;
    status: OrderStatus;

    serviceName?: string;
    subService?: string;
    serviceCategory?: string;
    deviceName?: string;
    description?: string;
    address?: string;

    scheduledAt?: string;
    expectedTime?: string;
    startedAt?: string;
    completedAt?: string;

    estimatedPrice?: number;
    finalPrice?: number;
    paymentMethod?: string;
    warrantyMonths?: number;

    customer?: OrderPartySummary;
    technician?: OrderPartySummary;

    priceAdjustment?: OrderPriceAdjustmentResponse;

    images?: string[];

    cancelledBy?: string;
    cancelReason?: string;
    cancelledAt?: string;

    createdAt?: string;
    updatedAt?: string;
}

export interface OrderListQuery {
    page?: number;
    size?: number;
}

export interface OrderPageResponse {
    items: OrderResponse[];
    page: number;
    size: number;
    totalPages: number;
    totalElements: number;
    first: boolean;
    last: boolean;
}
