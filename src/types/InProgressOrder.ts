export interface InProgressOrder {
    id: string;
    technicianId?: string;
    customerId?: string;
    serviceName: string;
    subService: string;
    technicianName: string;
    startTime: string;
    address: string;
    statusText: string;
    currentPrice: number;
    isWaitingApproval: boolean; // True nếu thợ vừa điều chỉnh giá và chờ khách đồng ý
}