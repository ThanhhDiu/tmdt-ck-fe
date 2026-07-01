export interface ScheduledOrder {
    id: string;
    technicianId?: string;
    customerId?: string;
    serviceName: string;
    subService: string;
    customerName: string;
    technicianName: string;
    time: string;
    address: string;
    statusText: string; // VD: "ĐÃ XÁC NHẬN", "ĐANG DI CHUYỂN"
    estPrice: number;
    note?: string;
    isWarranty?: boolean; // Cờ để xác định đây có phải là đơn bảo hành hay không
    description?: string; // Mô tả lỗi hoặc yêu cầu từ khách hàng, có thể dùng để hiển thị trên card
}