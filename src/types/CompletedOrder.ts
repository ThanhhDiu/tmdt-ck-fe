export interface CompletedOrder {
    id: string;
    serviceName: string;
    subService: string;
    customerName: string;
    technicianName: string;
    completionDate: string;
    totalPrice: number;
    rating: number; // Số sao đánh giá (0 nếu chưa đánh giá)
    warrantyTicket?: { status: string };
}