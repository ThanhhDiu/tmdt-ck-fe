export interface RequestData {
    id: string;
    customerId?: string;
    technicianId?: string;
    customerName: string; // Tên khách (nếu view là thợ)
    technicianName?: string; // Tên thợ (nếu view là khách)
    timeAgo: string;
    deviceName: string;
    description: string;
    address: string;
    estPrice: number;
    expectedTime: string;
    images: string[];
}