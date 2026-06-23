export interface Quote {
    serviceName: string;
    description: string;
    date: string;
    time: string;
    price: number;
    notes?: string;
    scheduledAt?: string;
}